const { Telegraf, Markup } = require("telegraf");
const { message } = require("telegraf/filters");

require("dotenv").config();

const { giga } = require("./auth");

const {
  plan,
  recept,
  currentTopic,
  newTopic,
  prompTxt,
} = require("./constants");

let messageMode = currentTopic;
let history;

const bot = new Telegraf(process.env.botToken);

bot.start(async (ctx) => {
  ctx.reply(
    "Приветствую в телегам-боте jxfferyBot.\nНиже представлены функции, которыми можно пользоваться (введите комманду):\n",
    "\n/role - Выбрать роль.\n/newtopic - начать новый диалог"
  );
});

bot.command("newtopic", async (ctx) => {
  messageMode = newTopic;
  history = [];

  await ctx.reply("Начат новый запрос");
});

bot.command("prompt", async (ctx) => {
  messageMode === prompTxt;

  try {
    await ctx.replyWithHTML(
      "<b>Выбери тему</b>",
      Markup.inlineKeyboard([
        [
          Markup.button.callback(recept.title, "btn_1"),
          Markup.button.callback(plan.title, "btn_2"),
        ],
      ])
    );
  } catch (e) {
    console.error(e);
  }
});

const addActionBot = (bot, id_btn, text) => {
  bot.action(id_btn, async (ctx) => {
    history = text;

    try {
      await ctx.answerCbQuery();

      await ctx.replyWithHTML(text, {
        disable_web_page_preview: true,
      });

      await ctx.deleteMessage();
    } catch (e) {
      console.error(e);
    }
  });
};

addActionBot(bot, "btn_1", recept.data);
addActionBot(bot, "btn_2", plan.data);

bot.on(message("text"), async (ctx) => {
  if (messageMode === newTopic) {
    const responseMessage = await giga(ctx.message.text);
    history = responseMessage;
    messageMode = currentTopic;

    return ctx.reply(responseMessage);
  }

  if (messageMode === prompTxt) {
    const responseMessage = await giga(promptTxt);
    history = responseMessage;
    messageMode = currentTopic;

    return ctx.reply(responseMessage);
  }

  if (messageMode === currentTopic) {
    const responseMessage = await giga(ctx.message.text, history);

    return ctx.reply(responseMessage);
  }
});

bot.launch();
console.log(`Bot запущен`);
