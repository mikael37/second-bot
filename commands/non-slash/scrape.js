module.exports = {
    name: "..scrape",
    description: "Scrapes data from the specified channel.",
    execute(message, args) {
      if (!args.length) {
        return message.reply("You need to specify a channel.");
      }
  
      const channelName = args[0];
      message.reply(`Recognized. You mentioned channel: ${channelName}`);
    },
  };
  