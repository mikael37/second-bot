module.exports = {
    name: "scrape",
    description: "Scrapes 9-digit numbers from a specified channel.",
    async execute(message, args) {
      if (!args.length) {
        return message.reply("You need to specify a channel.");
      }
  
      const channelName = args[0].toLowerCase().trim(); // Normalize input
      const targetChannel = message.guild.channels.cache.find(
        (channel) => 
          channel.name.toLowerCase() === channelName && 
          channel.type === 'GUILD_TEXT'  // Ensure it's a text channel
      );
  
      if (!targetChannel) {
        return message.reply(`Could not find the text channel named "${channelName}".`);
      }
  
      try {
        // Fetch the last 100 messages from the target channel
        const messages = await targetChannel.messages.fetch({ limit: 100 });
  
        // Regex to find 9-digit strings (no spaces or commas)
        const regex = /\b\d{9}\b/g;
  
        let foundNumbers = [];
  
        messages.forEach((msg) => {
          // Check each message content for 9-digit numbers
          const matches = msg.content.match(regex);
          if (matches) {
            foundNumbers = foundNumbers.concat(matches);
          }
        });
  
        if (foundNumbers.length === 0) {
          return message.reply("No 9-digit numbers were found in the specified channel.");
        }
  
        // Send the found numbers back to the channel where the command was executed in a vertical list
        const formattedList = foundNumbers.join("\n");
        message.reply(`Found the following 9-digit numbers:\n${formattedList}`);
      } catch (error) {
        console.error("Error while fetching messages or processing numbers:", error);
        message.reply("There was an error while scraping the specified channel.");
      }
    },
  };
  