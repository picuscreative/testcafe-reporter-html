module.exports = {
  customActions: {
    async clickMultipleTimes(selector, times) {
      while (times > 0 && times--) {
        await this.click(selector);
      }
    }
  }
};
