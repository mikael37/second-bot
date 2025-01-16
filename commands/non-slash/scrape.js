module.exports = {
    name: "scrape",
    description: "Scrapes ID or Alliance and Reason from a specified channel.",
    async execute(message, args) {
      if (!args.length) {
        return message.reply("You need to specify a channel.");
      }
  
      const channelMention = args[0];
      const regex = /<#(\d+)>/;
  
      const match = channelMention.match(regex);
      if (!match) {
        return message.reply("Please provide a valid channel mention (e.g., #CHANNELNAME).");
      }
  
      const channelId = match[1];
      const targetChannel = message.guild.channels.cache.get(channelId);
  
      if (!targetChannel) {
        return message.reply(`Could not find the channel with the ID "${channelId}".`);
      }
  
      try {
        const messages = await targetChannel.messages.fetch({ limit: 100 });
        const idRegex = /ID: (\d{9})/g;
        const reasonRegex = /Reason: (.+)/g;
        const allianceRegex = /Alliance: (.+)/g;
  
        let results = [];
  
        messages.forEach((msg) => {
          const idMatch = msg.content.match(idRegex);
          const reasonMatch = msg.content.match(reasonRegex);
          const allianceMatch = msg.content.match(allianceRegex);
  
          if (idMatch && reasonMatch) {
            const id = idMatch[0].split("ID: ")[1];
            const reason = reasonMatch[0].split("Reason: ")[1];
            results.push(`ID: ${id}, Reason: ${reason}`);
          } else if (allianceMatch && reasonMatch) {
            const alliance = allianceMatch[0].split("Alliance: ")[1];
            const reason = reasonMatch[0].split("Reason: ")[1];
            results.push(`Alliance: ${alliance}, Reason: ${reason}`);
          }
        });
  
        if (results.length === 0) {
          return message.reply("No ID/Alliance and Reason pairs found in the specified channel.");
        }
  
        const formattedList = results.join("\n");
        message.reply(`Found the following details:\n${formattedList}`);
      } catch (error) {
        console.error("Error while fetching messages or processing details:", error);
        message.reply("There was an error while scraping the specified channel.");
      }
    },
  };
  