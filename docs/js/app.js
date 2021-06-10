App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("V7sionTokenSale.json", function(V7sionTokenSale) {
      App.contracts.V7sionTokenSale = TruffleContract(V7sionTokenSale);
      App.contracts.V7sionTokenSale.setProvider(App.web3Provider);
      App.contracts.V7sionTokenSale.deployed().then(function(V7sionTokenSale) {
        console.log("V7sion Token Sale Address:", V7sionTokenSale.address);
      });
    }).done(function() {
      $.getJSON("V7sionToken.json", function(V7sionToken) {
        App.contracts.V7sionToken = TruffleContract(V7sionToken);
        App.contracts.V7sionToken.setProvider(App.web3Provider);
        App.contracts.V7sionToken.deployed().then(function(V7sionToken) {
          console.log("V7sion Token Address:", V7sionToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.V7sionTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.V7sionTokenSale.deployed().then(function(instance) {
      V7sionTokenSaleInstance = instance;
      return V7sionTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return V7sionTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.V7sionToken.deployed().then(function(instance) {
        V7sionTokenInstance = instance;
        return V7sionTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.V7sion-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    console.log(numberOfTokens)
    App.contracts.V7sionTokenSale.deployed().then(function(instance) {
      console.log(instance);
      console.log(App.account);
      console.log(numberOfTokens * App.tokenPrice);
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
