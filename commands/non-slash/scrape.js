module.exports = {
    name: "scrape",
    description: "Scrapes 9-digit numbers from a specified channel.",
    async execute(message, args) {
      if (args.length < 2) {
        return message.reply("You need to specify both the channel and the additional argument (e.g., 'channel 14').");
      }
  
      // Extract the channel mention (e.g., #blacklist)
      const channelMention = args[0];
      const additionalArg = args.slice(1).join(" ");  // Join the remaining args into a single string for the additional argument(s)
  
      // Make sure the channel mention starts with '#'
      if (!channelMention.startsWith("#")) {
        return message.reply("You must mention a channel (e.g., #blacklist).");
      }
  
      // Find the channel based on the mention
      const targetChannel = message.guild.channels.cache.find(
        (channel) => channel.name === channelMention.slice(1) // Remove the '#' symbol
      );
  
      if (!targetChannel) {
        return message.reply(`Could not find the channel named "${channelMention}".`);
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
  
        // Optionally, send the additional argument back as well (e.g., 'channel 14')
        message.reply(`Additional argument received: ${additionalArg}`);
  
      } catch (error) {
        console.error("Error while fetching messages or processing numbers:", error);
        message.reply("There was an error while scraping the specified channel.");
      }
    },
  };
  