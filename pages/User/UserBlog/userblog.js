Page({
  data: {
    choices: ["rock", "paper", "scissors"],
    emojiMap: {
      rock: "✊",
      paper: "✋",
      scissors: "✌️"
    },
    computerChoice: "😼",
    result: "点击试试！",
    animationInterval: null,
    fireworks: [],
    rockKind: 0,
    computerHealth: 10, // 电脑生命值初始为3
    died:false
  },

  onRockClick() {
    this.setData({ rockKind: 1 });
    this.playGame("rock");
  },

  onPaperClick() {
    this.setData({ rockKind: 2 });
    this.playGame("paper");
  },

  onScissorsClick() {
    this.setData({ rockKind: 3 });
    this.playGame("scissors");
  },

  playGame(playerChoice) {
    const choices = this.data.choices;
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    clearInterval(this.data.animationInterval);
    let currentIndex = 0;

    const animationInterval = setInterval(() => {
      this.setData({ computerChoice: this.data.emojiMap[choices[currentIndex]] });
      currentIndex = (currentIndex + 1) % choices.length;
    }, 100);

    setTimeout(() => {
      clearInterval(animationInterval);
      this.setData({ computerChoice: this.data.emojiMap[computerChoice] });
      this.displayResult(playerChoice, computerChoice);
    }, 1500);
  },

  displayResult(playerChoice, computerChoice) {
    let result = "";

    if (playerChoice === computerChoice) {
      result = "承让承让😽";
    } else if (
      (playerChoice === "rock" && computerChoice === "scissors") ||
      (playerChoice === "paper" && computerChoice === "rock") ||
      (playerChoice === "scissors" && computerChoice === "paper")
    ) {
      result = `给他一拳😿`;
      this.triggerFireworks();
      this.reduceComputerHealth(); // 玩家赢了，减少电脑生命值
    } else {
      result = `挨揍了吧😾`;
    }

    this.setData({ result });
  },

  reduceComputerHealth() {
    var that=this
    let newHealth = this.data.computerHealth - 1;
    that.setData({ computerHealth: newHealth });
    console.log(newHealth)
    if (newHealth ==-5) {
      wx.showModal({
        title: "👌",
        content: "死给你看",
        showCancel: false,
        success: () => {
          that.setData({ died: true });
        }
      });
    }
    else if (newHealth == 0) {
      wx.showModal({
        title: "🙇",
        content: "求求了不要杀我😭",
        showCancel: false,
        success: () => {
          
        }
      });
    }
    else if (newHealth == 1) {
      wx.showModal({
        title: "😿",
        content: "你真的要赶尽杀绝吗？",
        showCancel: false,
        success: () => {
        
        }
      });
    }
    else if(newHealth == 3){
      wx.showModal({
        title: "😿",
        content: "年轻人，点到为止！",
        showCancel: false,
        success: () => {
          
        }
      });
    }
    else if(newHealth == 2){
      wx.showModal({
        title: "😿",
        content: "我妈妈还在家里等我🥺",
        showCancel: false,
        success: () => {
          
        }
      });
    }
  },





  triggerFireworks() {
    const fireworks = [];
    for (let i = 0; i < 10; i++) {
      fireworks.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`
      });
    }

    this.setData({ fireworks });

    setTimeout(() => {
      this.setData({ fireworks: [] });
    }, 1000);
  }
});
