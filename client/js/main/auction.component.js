(function () {
    angular.module('game')
        .component('auction', {
            templateUrl: 'js/main/auction.html',
            bindings: {
                player: '<'
            },
            controller: AuctionController
        });

    AuctionController.$inject = ['socket', '$interval', '$scope', 'AuctionService'];
    function AuctionController(socket, $interval, $scope, AuctionService) {
        var $ctrl = this;

        $ctrl.endAuction = false;
        var minBidText = 'Minimum bid';
        var firstBid;
        var timer;

        // Initializes values
        var init = function () {
            $ctrl.activeAuctions = false;
            $ctrl.bidText = minBidText;
            firstBid = false;
        };
        init();

        var startAuction = function (auction) {
            $ctrl.auction = auction;
            $ctrl.winningBid = auction.minBid;
            $ctrl.bid = auction.minBid;
            $ctrl.activeAuctions = true;

            timer = $interval(function () {
                $ctrl.auction.duration--;
            }, 1000);
        };

        // On connect, send an event asking for the current auction
        AuctionService.getOnGoingAuction()
            .then(function (auction) {
                if (auction && auction != '') {
                    startAuction(auction);
                }
            })
            .catch(function (reason) {
                console.error(reason);
            });


        socket.on('startAuction', function (data) {
            startAuction(data);
        });

        socket.on('newBid', function (data) {
            if (firstBid == false) {
                firstBid = true;
                $ctrl.bidText = 'Winning bid';
            }
            $ctrl.auction.duration = data.duration;
            $ctrl.winningBid = data.bid;
            $ctrl.bid = $ctrl.winningBid + 1;
        });

        socket.on('endAuction', function (data) {
            init();
            $interval.cancel(timer);
            $scope.$apply();    // This is probably bad practice (change later)

            if (data) {
                $scope.$emit('endAuction', data.itemName);
                $ctrl.endAuction = true;
                $ctrl.winningBid = data.bid;
                $ctrl.buyer = data.buyer;

                $interval(function () {
                    $ctrl.endAuction = false;
                }, 10000, 1);
            }
        });

        $ctrl.controlLimit = function () {
            if ($ctrl.bid < $ctrl.winningBid) {
                $ctrl.bid = $ctrl.winningBid;
            }
        };

        $ctrl.placeBid = function () {
            var bidObj = {
                id: $ctrl.auction.ID,
                bidder: $ctrl.player,
                bid: $ctrl.bid
            };
            socket.emit('placeBid', bidObj);
        };
    }
})();
