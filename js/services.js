prmApp

    .service('fileUpload', ['$http', function ($http) {
        this.uploadFileToUrl = function(file, uploadUrl){
            var fd = new FormData();
            fd.append('file', file);
        
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        
            .success(function(){
            })
        
            .error(function(){
            });
        }
    }])
    // =========================================================================
    // Auction Details Services
    // =========================================================================
    .service('auctionsService', function($http,store,$state,$rootScope,domain, version) {
        //var domain = 'http://182.18.169.32/services/';
        var auctions = this;
		auctions.   getdate = function(){
            var date = new Date();
            var time = date.getTime();
            return $http({
                method: 'GET',
                url: domain+'getdate?time=' + time,
                encodeURI: true,
                headers: {'Content-Type': 'application/json'}
                //data: params
            }).then(function(response) {
                var list=[];
                if(response && response.data ){
                     if(response.data.length>0){
                        list=response.data;   
                     }
                     return list;
                }else{
                    console.log(response.data[0].errorMessage);
                }
            }, function(result) {
                console.log("date error");
            });
		}

		auctions.isnegotiationended = function (reqid, sessionid) {
		    return $http({
		        method: 'GET',
		        url: domain + 'isnegotiationended?reqid=' + reqid + '&sessionid=' + sessionid,
		        encodeURI: true,
		        headers: { 'Content-Type': 'application/json' }
		        //data: params
		    }).then(function (response) {
		        var list = {};
		        if (response && response.data) {
		            return response.data;
		        } else {

		        }
		    }, function (result) {
		        console.log("date error");
		    });
		}

        auctions.selectVendor = function(params){
            return $http({
                method: 'POST',
                url: domain+'selectvendor',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     return response.data;
                }else{
                    
                }
            }, function(result) {
                console.log(result);
            });
        }

        auctions.getauctions=function (params) {
            return $http({
                method: 'GET',
                url: domain+'getrunningauctions?section='+params.section+'&userid='+params.userid+'&sessionid='+params.sessionid+'&limit='+params.limit,
                encodeURI: true,
                headers: {'Content-Type': 'application/json'}
                //data: params
            }).then(function(response) {
                var list=[];
                if(response && response.data ){
                     if(response.data.length>0){
                        list=response.data;   
                     }
                     return list;
                }else{
                    console.log(response.data[0].errorMessage);
                }
            }, function(result) {
                console.log("there is no current Negotiations");
            });
        };

        auctions.rateVendor = function(params){
            return $http({
                method: 'POST',
                url: domain+'userratings',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     return response.data;
                }else{
                    
                }
            }, function(result) {
                console.log(result);
            });
        }



        auctions.updateStatus = function(params){
            return $http({
                method: 'POST',
                url: domain+'updatestatus',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     return response.data;
                }else{
                    
                }
            }, function(result) {
                console.log(result);
            });
        }


        auctions.updatedeliverdate = function (params) {
            return $http({
                method: 'POST',
                url: domain + 'updateexpdelandpaydate',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                var list = {};
                if (response && response.data) {
                    return response.data;
                } else {

                }
            }, function (result) {
                console.log(result);
            });
        }


        auctions.updatepaymentdate = function (params) {
            return $http({
                method: 'POST',
                url: domain + 'updateexpdelandpaydate',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                var list = {};
                if (response && response.data) {
                    return response.data;
                } else {

                }
            }, function (result) {
                console.log(result);
            });
        }


        auctions.StartNegotiation = function (params) {
            return $http({
                method: 'POST',
                url: domain + 'startNegotiation',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                var list = {};
                if (response && response.data) {
                    return response.data;
                } else {

                }
            }, function (result) {
                console.log("StartNegotiation==================StartNegotiation");
            });
        }


        auctions.RestartNegotiation = function (params) {
            return $http({
                method: 'POST',
                url: domain + 'restartnegotiation',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                var list = {};
                if (response && response.data) {
                    return response.data;
                } else {

                }
            }, function (result) {
                console.log("StartNegotiation==================StartNegotiation");
            });
        }

        auctions.DeleteVendorFromAuction = function (params) {
            return $http({
                method: 'POST',
                url: domain + 'deletevendorfromauction',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                var list = {};
                if (response && response.data) {
                    return response.data;
                } else {

                }
            }, function (result) {

            });
        }

        auctions.generatepo = function(params){
            var data = {
                reqPO: params
            };
            return $http({
                method: 'POST',
                url: domain+'generatepoforuser',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: data
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    
                }
            }, function(result) {
                console.log(result);
            });
        }



        auctions.materialdispatch = function(params){
            var data = {
                reqMat: params
            };
            return $http({
                method: 'POST',
                url: domain+'materialdispatch',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: data
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    
                }
            }, function(result) {
                console.log(result);
            });
        }

        auctions.paymentdetails = function(params){
            var data = {
                paymentDets: params
            };
            return $http({
                method: 'POST',
                url: domain+'paymentdetails',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: data
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    
                }
            }, function(result) {
                console.log(result);
            });
        }


        auctions.generatePOinServer = function(params){
            return $http({
                method: 'POST',
                url: domain+'generatepo',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    
                }
            }, function(result) {
                console.log(result);
            });
        }

        auctions.getDashboardStats = function(params){
            return $http({
                method:'GET',
                url:domain + 'getdashboardstats?userid='+params.userid+'&sessionid='+params.sessionid,
                encodeURI:true,
                headers:{'Content-Type': 'application/json'}
            }).then(function(response){
                if(response && response.data){
                    if( response.data.errorMessage == ''){
                        return response.data;
                    } else {
                        return {};
                    }                    
                }
            });
        };

        auctions.getCategories=function (params) {
            return $http({
                method: 'GET',
                url: domain+'getcategories?userid=' + (params ? params : -1),
                encodeURI: true,
                headers: {'Content-Type': 'application/json'}
                //data: params
            }).then(function(response) {
                var list=[];
                if(response && response.data ){
                     if(response.data.length>0){
                        list=response.data;   
                     }
                     return list;
                }else{
                    console.log(response.data[0].errorMessage);
                }
            }, function(result) {
                console.log("there is no categories");
            });
        };

        auctions.getmyAuctions= function(params){
            return $http({
                method: 'GET',
                url: domain+'getmyauctions?userid='+params.userid+"&sessionid="+params.sessionid,
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    console.log(response.data.errorMessage);
                }
            }, function(result) {
                console.log(result);
                console.log("there is no your Negotiations");
            });
        };






        auctions.getactiveleads= function(params){
            return $http({
                method: 'GET',
                url: domain+'getactiveleads?userid='+params.userid+"&sessionid="+params.sessionid,
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    console.log(response.data.errorMessage);
                }
            }, function(result) {
                console.log(result);
                console.log("there is no your Negotiations");
            });
        };




        auctions.getrequirementdata = function(params){
            return $http({
                method: 'GET',
                url: domain+'getrequirementdata?reqid='+params.reqid+"&sessionid="+params.sessionid+"&userid="+params.userid,
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    console.log(response.data.errorMessage);
                }
            }, function(result) {
                console.log(result);
                console.log("there is no current Negotiations");
            });
        };

        auctions.GetBidHistory = function (params) {
            return $http({
                method: 'GET',
                url: domain + 'getbidhistory?reqid=' + params.reqid + "&sessionid=" + params.sessionid + "&userid=" + params.userid,
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                var list = {};
                if (response && response.data) {
                    list = response.data;
                    return list;
                } else {
                    console.log(response.data.errorMessage);
                }
            }, function (result) {
                console.log(result);
                console.log("there is no current Negotiations");
            });
        };

        auctions.getpodetails = function (params) {
            return $http({
                method: 'GET',
                url: domain + 'getpodetails?reqid=' + params.reqid + "&sessionid=" + params.sessionid + "&userid=" + params.userid,
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                var list = {};
                if (response && response.data) {
                    list = response.data;
                    return list;
                } else {
                    console.log(response.data.errorMessage);
                }
            }, function (result) {
                console.log(result);
                console.log("there is no current Negotiations");
            });
        };
        
        auctions.getcomments = function(params){
            return $http({
                method: 'GET',
                url: domain+'getcomments?reqid='+params.reqid + "&userID=" + params.userid +  "&sessionid="+params.sessionid,
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    console.log(response.data.errorMessage);
                }
            }, function(result) {
                console.log(result);
                console.log("there is no current Negotiations");
            });
        };
        
        auctions.savecomment = function(params){
            var comment = {
                "com": {
                    "requirementID": params.reqID,
                    "firstName": "",
                    "lastName": "",
                    "userID": params.userID,
                    "commentText": params.commentText,
                    "replyCommentID": -1,
                    "commentID": -1,
                    "errorMessage": "",
                    "sessionID": params.sessionID
                }
            }
            return $http({
                method: 'POST',
                url: domain+'savecomment',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: comment
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    console.log(response.data.errorMessage);
                }
            }, function(result) {
                console.log(result);
                console.log("there is no current Negotiations");
            });
        };


        auctions.deleteAttachment = function(Attaachmentparams){
           // params.action="updatebidtime";
            return $http({
                method: 'POST',
                url: domain+'deleteattachment',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: Attaachmentparams
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    
                }
            }, function(result) {
                console.log("service failed, please try later...!");
            });
        };
        

        auctions.postrequirementdata = function(params){
            //params.action="requirementsave";
            var myDate = new Date(); // Your timezone!
            var myEpoch = parseInt(myDate.getTime()/1000);
            console.log(myEpoch);
            var requirement = {
            "requirement": {
                "title": params.title,
                "description": params.description,
                "category": params.category,
                "subcategories": params.subcategories,
                "urgency": params.urgency,
                "budget": params.budget,
                "attachmentName": params.attachmentName,
                "deliveryLocation": params.deliveryLocation,
                "taxes": params.taxes,
                "paymentTerms": params.paymentTerms,
                "requirementID": params.requirementID,
                "customerID": params.customerID,
                "isClosed": params.isClosed,
                "endTime": null,
                "sessionID": params.sessionID,
                "errorMessage": "",
                "timeLeft": -1,
                "price": -1,
                "auctionVendors": params.auctionVendors,
                "startTime": null,
                "status": "",
                "postedOn": "/Date("+myEpoch+"000+0000)/",
                "custLastName": params.customerLastname,
                "custFirstName":params.customerFirstname,
                "deliveryTime": params.deliveryTime, 
                "includeFreight": params.includeFreight, 
                "inclusiveTax": params.inclusiveTax,
                "minBidAmount": 0,
                "checkBoxEmail": params.checkBoxEmail,
                "checkBoxSms": params.checkBoxSms,
                "quotationFreezTime": params.quotationFreezTime
            },"attachment":params.attachment
        };
            return $http({
                method: 'POST',
                url: domain+'requirementsave',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: requirement
            }).then(function(response) {
                var list = {};
                if(response && response.data ){
                     list=response.data;
                     return list;
                }else{
                    console.log(response.data.errorMessage);
                }
            }, function(result) {
                console.log(result);
                console.log("there is no current Negotiations");
            });
        };
        
        auctions.updatebidtime = function(params){
           // params.action="updatebidtime";
            return $http({
                method: 'POST',
                url: domain+'updatebidtime',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                if(response && response.data ){
                     return "";
                }else{
                    return response.data.errorMessage;
                }
            }, function(result) {
                console.log("service failed, please try later...!");
            });
        };
        
        auctions.makeabid = function(params){
            //params.action="makeabid";
            var list=[];
            return $http({
                method: 'POST',
                url: domain+'makeabid',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                if(response && response.data ){
                     //return "";
                     list=response.data;
                     return list;
                }else{
                    return response.data.errorMessage;
                }
            }, function(result) {
                console.log("service failed, please try later...!");
            });
        };



        auctions.revquotationupload = function (params) {
            //params.action="makeabid";
            var list = [];
            return $http({
                method: 'POST',
                url: domain + 'revquotationupload',
                encodeURI: true,
                headers: { 'Content-Type': 'application/json' },
                data: params
            }).then(function (response) {
                if (response && response.data) {
                    //return "";
                    list = response.data;
                    return list;
                } else {
                    return response.data.errorMessage;
                }
            }, function (result) {
                console.log("service failed, please try later...!");
            });
        };


        
        auctions.updateauctionstart = function(params){
            //params.action="makeabid";
            return $http({
                method: 'POST',
                url: domain+'updateauctionstart',
                encodeURI: true,
                headers: {'Content-Type': 'application/json'},
                data: params
            }).then(function(response) {
                if(response && response.data ){
                     return "";
                }else{
                    return response.data.errorMessage;
                }
            }, function(result) {
                console.log("service failed, please try later...!");
            });
        };

        return auctions;        
    })

    // =========================================================================
    // Header Messages and Notifications list Data
    // =========================================================================

    .service('messageService', ['$resource', function($resource){
       /* this.getMessage = function(img, user, text) {
            var gmList = $resource("data/messages-notifications.json");
            
            return gmList.get({
                img: img,
                user: user,
                text: text
            });
        }*/
    }])
    

     

    // =========================================================================
    // Malihu Scroll - Custom Scroll bars
    // =========================================================================
    .service('scrollService', function() {
        var ss = {};
        ss.malihuScroll = function scrollBar(selector, theme, mousewheelaxis) {
            $(selector).mCustomScrollbar({
                theme: theme,
                scrollInertia: 100,
                axis:'yx',
                mouseWheel: {
                    enable: true,
                    axis: mousewheelaxis,
                    preventDefault: true
                }
            });
        }
        
        return ss;
    })






    //==============================================
    // BOOTSTRAP GROWL
    //==============================================

    .service('growlService', function(){
        var gs = {};
        gs.growl = function(message, type) {
            $.growl({
                message: message
            },{
                type: type,
                allow_dismiss: false,
                label: 'Cancel',
                className: 'btn-xs btn-inverse',
                placement: {
                    from: 'top',
                    align: 'right'
                },
                delay: 2500,
                animate: {
                        enter: 'animated bounceIn',
                        exit: 'animated bounceOut'
                },
                offset: {
                    x: 20,
                    y: 85
                }
            });
        }
        
        return gs;
    })
