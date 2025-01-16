module.exports = {
    name: "scrape",
    description: "Scrapes 9-digit numbers from a specified channel.",
    async execute(message, args) {
      if (!args.length) {
        return message.reply("You need to specify a channel.");
      }
  
      // Check if the first argument is a channel mention
      const channelMention = args[0];
  
      // Regular expression to match channel mentions (e.g., <#123456789012345678>)
      const regex = /<#(\d+)>/;
  
      // If the argument isn't a valid channel mention, reply with an error
      const match = channelMention.match(regex);
      if (!match) {
        return message.reply("Please provide a valid channel mention (e.g., #CHANNELNAME).");
      }
  
      // Extract the channel ID from the mention
      const channelId = match[1];
  
      // Fetch the channel using the channel ID
      const targetChannel = message.guild.channels.cache.get(channelId);
  
      if (!targetChannel) {
        return message.reply(`Could not find the channel with the ID "${channelId}".`);
      }
  
      try {
        // Fetch the last 100 messages from the target channel
        const messages = await targetChannel.messages.fetch({ limit: 100 });
  
        // Regex to find 9-digit strings (no spaces or commas)
        const numberRegex = /\b\d{9}\b/g;
  
        let foundNumbers = [];
  
        messages.forEach((msg) => {
          // Check each message content for 9-digit numbers
          const matches = msg.content.match(numberRegex);
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
  