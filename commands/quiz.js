/**
 * @name Seoa:Quiz
 * @description Quiz command
 */

const QuizData = require('../QuizData/quizs.json')
const discord = require('discord.js')
const fs = require('fs')

exports.run = (seoa, msg, settings) => {
  const msgArray = msg.content.split(' ')
  const filter = (reaction, user) =>
    (reaction.emoji.name === '⭕' ||
    reaction.emoji.name === '❌') &&
    user.id === msg.author.id

  /**
   * @type {number}
   */
  let quizNum
  if (!msg.content.toLowerCase().includes('point') && !msg.content.includes('포인트')) {
    if (!msgArray[1]) {
      quizNum = Math.floor(Math.random() * (QuizData.length - 1))
    } else {
      if (msgArray[1] < QuizData.length) {
        quizNum = Math.floor(msgArray[1])
      } else if ((QuizData.filter(quiz => quiz.language === msgArray[1])).length > 0) {
        const quizsFiltered = QuizData.filter(quiz => quiz.language === msgArray[1])
        quizNum = QuizData.indexOf(quizsFiltered[Math.floor(Math.random() * (quizsFiltered.length - 1))])
      } else {
        const quizNumberNotExist = new discord.RichEmbed()
          .setColor(0xff0000)
          .addField('퀴즈 No. ' + msgArray[1] + '(을)를 찾을 수 없습니다.', '퀴즈는 No. ' + (QuizData.length - 1) + '까지만 등록되어 있습니다.')
        return msg.channel.send(quizNumberNotExist)
      }
    }
    const quizEmbed = new discord.RichEmbed()
      .setColor(0x0000ff)
      .setAuthor(msg.author.username + '님이 Code Quiz를 푸는 중입니다...', msg.author.displayAvatarURL)
      .setTitle('Quiz No.' + quizNum)
      .addField('Q. ' + QuizData[quizNum].question.replace('{username}', msg.author.username), '제한시간은 **1분**입니다.')
    if (QuizData[quizNum].image) {
      quizEmbed.setImage(QuizData[quizNum].image)
    }
    msg.channel.send(quizEmbed).then((th) => {
      if (Math.floor(Math.random() * 1)) {
        th.react('⭕')
        setTimeout(() => {
          th.react('❌')
        }, 1000)
      } else {
        th.react('❌')
        setTimeout(() => {
          th.react('⭕')
        }, 1000)
      }
      th.awaitReactions(filter, {
        time: 60000,
        max: 1
      }).then((collected) => {
        if (!collected) {
          const quizFailByLate = new discord.RichEmbed()
            .setColor(0x808080)
            .setDescription('[Code Quiz 추가 요청하러 가기!](https://github.com/seoaapp/SeoaBot/issues/new/choose)')
            .setAuthor(msg.author.username + '님 - 타임 오버입니다!', msg.author.displayAvatarURL)
            .setTitle('Quiz No.' + quizNum)
            .addField('Q. ' + QuizData[quizNum].question.replace('{username}', msg.author.username), '**A.** ' + QuizData[quizNum].explanation)
          if (QuizData[quizNum].image) {
            quizFailByLate.setImage(QuizData[quizNum].image)
          }
          th.edit(quizFailByLate)
        } else {
          let QuizAwnser
          if (QuizData[quizNum].awnser === true) {
            QuizAwnser = '⭕'
          } else if (QuizData[quizNum].awnser === false) {
            QuizAwnser = '❌'
          }
          const userData = require('../UserData/users.json')

          // 맞았을 경우
          if (collected.array()[0].emoji.name === QuizAwnser) {
            const quizCorrectEmbed = new discord.RichEmbed()
              .setColor(0x00ff00)
              .setDescription('[Code Quiz 오류 제보하러 가기!](https://github.com/seoaapp/SeoaBot/issues/new/choose)')
              .setAuthor(msg.author.username + '님 - 정답입니다!', msg.author.displayAvatarURL)
              .setTitle('Quiz No.' + quizNum)
              .addField('Q. ' + QuizData[quizNum].question.replace('{username}', msg.author.username), '**A.** ' + QuizData[quizNum].explanation)
            if (QuizData[quizNum].image) {
              quizCorrectEmbed.setImage(QuizData[quizNum].image)
            }
            th.edit(quizCorrectEmbed)
            userData[msg.author.id].quizPoint++
            fs.writeFileSync('./UserData/users.json', JSON.stringify(userData, null, '  '))
          } else { // 틀렸을 경우
            const quizNotCorrectEmbed = new discord.RichEmbed()
              .setColor(0xff0000)
              .setDescription('[Code Quiz 문의하러 가기!](https://github.com/seoaapp/SeoaBot/issues/new/choose)')
              .setAuthor(msg.author.username + '님 - 오답입니다!', msg.author.displayAvatarURL)
              .setTitle('Quiz No.' + quizNum)
              .addField('Q. ' + QuizData[quizNum].question.replace('{username}', msg.author.username), '**A.** ' + QuizData[quizNum].explanation)
            if (QuizData[quizNum].image) {
              quizNotCorrectEmbed.setImage(QuizData[quizNum].image)
            }
            th.edit(quizNotCorrectEmbed)
            userData[msg.author.id].quizPoint--
            fs.writeFileSync('./UserData/users.json', JSON.stringify(userData, null, '  '))
          }
        }
      })
    })
  } else {
    const userData = require('../UserData/users.json')
    msg.channel.send('**' + userData[msg.author.id].quizPoint + '** 포인트 입니다.')
  }
}

exports.callSign = ['quiz', 'Quiz', '퀴즈']
exports.helps = {
  description: '프로그래밍에 대한 퀴즈를 풀 수 있습니다.',
  uses: '>quiz'
}
