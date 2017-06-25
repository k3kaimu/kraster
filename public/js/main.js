$(function(){
    function MainViewModel()
    {
        var self = this;

        this.nodes = ko.observableArray();
        this.users = ko.observableArray();
        this.jobs = ko.observableArray();

        this.jobScript = ko.observable("");
        this.jobScript(this.jobScript() + "#PBS -q wLrchq\n");
        this.jobScript(this.jobScript() + "#PBS -l nodes=1:ppn=1,mem=5gb,pmem=5gb,vmem=5gb,pvmem=5gb\n");
        this.jobScript(this.jobScript() + "\n");
        this.jobScript(this.jobScript() + "sleep 10m");

        this.dataList = ko.observable("");
        this.dataList(this.dataList() + "(function(){ return []; })");

        this.totalCPUs = ko.computed(function(){
            var total = 0;
            var us = self.users();
            for(var i = 0; i < us.length; ++i)
                total += us[i].cpus;
            return total;
        });


        this.enqueueJob = function(){
            var code = self.jobScript();
            var datalist = eval(self.dataList());
            console.log(datalist);
            if(datalist.length == 0)
                datalist = [0];

            for(var i = 0; i < datalist.length; ++i){
                var output = Mustache.render(code, datalist[i]);
                MyAPI.qsub([output]);
            }
        };


        this.deleteJob = function(data){
            console.log(data.id.split('.')[0]);
            MyAPI.qdel(data.id.split('.')[0]);
        };

        this.deleteAll = function(){
            MyAPI.qdelall();
        };

        // this.sendImage = function(imgname) {
        //     self.sendingImg(imgname);
        //     self.isOpenSendMonitorModal(true);
        //     MyAPI.sendImage(imgname);
        // };

        // this.deleteImage = function(imgname){
        //     MyAPI.delImage(imgname);
        // };

        // this.saveCanvasImage = function() {
        //     var dataURI = canvasToString();
        //     MyAPI.saveImage("foo.png", dataURI, function(res){});
        // };

        // this.saveAndSendCanvasImage = function() {
        //     var dataURI = canvasToString();
        //     MyAPI.saveImage("foo.png", dataURI, function(res){
        //         self.sendImage(res);
        //     });
        // }

        // this.isOpenReceiveMonitorModal = ko.observable(false);
        // this.isOpenSendMonitorModal = ko.observable(false);

        // this.sendingImg = ko.observable("");
        // this.receivedImg = ko.observable("");


        // this.receivedLastFrameId = ko.observable(0);
        // this.totalFramesOfNowReceivedData = ko.observable(0);
        
        // this.isReceivingState = ko.computed(function(){
        //     if(self.receivedLastFrameId() != 0) self.isOpenReceiveMonitorModal(true);
        //     return self.receivedLastFrameId() != 0;
        // });

        // this.percentageOfReceivingState = ko.pureComputed(function(){
        //     if(self.receivedLastFrameId() == self.totalFramesOfNowReceivedData()) return 100;
        //     else return Math.floor(100.0 * self.receivedLastFrameId() / self.totalFramesOfNowReceivedData());
        // });

        // this.isCompletedReceiveFullData = ko.pureComputed(function(){
        //     return self.receivedLastFrameId() == self.totalFramesOfNowReceivedData();
        // });

        // this.totalFramesOfNowSendingData = ko.observable(0);
        // this.receivedTotalACK = ko.observable(0);
        // this.totalSizeOfNowSendingData = ko.observable(0);

        // this.isSendingState = ko.computed(function(){
        //     if(self.receivedTotalACK() != 0) self.isOpenSendMonitorModal(true);
        //     return self.receivedTotalACK() != 0;
        // });

        // this.percentageOfSendingState = ko.pureComputed(function(){
        //     if(self.totalFramesOfNowSendingData() == self.receivedTotalACK()) return 100;
        //     else return Math.floor(100.0 * self.receivedTotalACK() / self.totalFramesOfNowSendingData());
        // });

        // this.isCompletedSendFullData = ko.pureComputed(function(){
        //     return self.totalFramesOfNowSendingData() == self.receivedTotalACK();
        // });

        // this.isTerminated = ko.observable(false);

        // this.restart = function(){
        //     MyAPI.restart();
        // };

        // this.errors = ko.observableArray();

        // this.removeErrorAt = function(index) {
        //     this.errors.splice(index, 1);
        // };

        this.isConnectedToWS = ko.observable(false);

        // this.isPHYMACAllRight = ko.observable(true);
    }

    mainVM = new MainViewModel();
    ko.applyBindings(mainVM);

    // ko.bindingHandlers['imgsrc'] = {
    //     update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    //         var src = valueAccessor().map(function(item){return ko.unwrap(item)});
    //         if(src.indexOf(undefined)==-1){
    //             element.setAttribute('src',src.join(''));
    //         }
    //     }
    // };

    // ko.bindingHandlers["modal"] = {
    //     init: function (element, valueAccessor) {
    //         $(element).modal({
    //             show: false
    //         });

    //         var value = valueAccessor();
    //         if (ko.isObservable(value)) {
    //             $(element).on('hide.bs.modal', function() {
    //             value(false);
    //             });
    //         }
    //     },
    //     update: function (element, valueAccessor) {
    //         var value = valueAccessor();
    //         if (ko.utils.unwrapObservable(value)) {
    //             $(element).modal('show');
    //         } else {
    //             $(element).modal('hide');
    //         }
    //     }
    // };
});



$(function(){
    connectToWS();
});


function connectToWS()
{
    var hn = window.location.hostname;
    var pn = window.location.port;
    socket = new WebSocket("ws://" + hn +":" + pn +"/ws");

    socket.onopen = function(){
        // mainVM.isConnectedToWS(true);
    };

    socket.onmessage = function(message) {
        console.log(message.data);
        var obj = JSON.parse(message.data);

        if(obj.type == "updateUserStatus")
        {
            mainVM.jobs(obj.data);
        }
        else if(obj.type == "updateClusterStatus")
        {
            mainVM.nodes(obj.data.nodes);
            mainVM.users(obj.data.users);
        }

        // if(obj.type == "updateRecvImage")
        //     updateRecvImages();
        // else if(obj.type == "updateSendImage")
        //     updateSendImages();
        // else if(obj.type == "receiveDataFrame"){
        //     mainVM.isPHYMACAllRight(true);
        //     mainVM.totalFramesOfNowReceivedData(obj.totalFrames);
        //     mainVM.receivedLastFrameId(obj.frameId);
        //     mainVM.receivedImg("");
        //     mainVM.isOpenReceiveMonitorModal(true);
        // }else if(obj.type == "receiveFullData"){
        //     mainVM.isPHYMACAllRight(true);
        //     mainVM.totalFramesOfNowReceivedData(obj.totalFrames);
        //     mainVM.receivedLastFrameId(obj.totalFrames);
        //     mainVM.receivedImg(obj.img);
        // }else if(obj.type == "sendData"){
        //     mainVM.isPHYMACAllRight(true);
        //     mainVM.totalFramesOfNowSendingData(obj.totalFrames);
        //     mainVM.totalSizeOfNowSendingData(obj.size);
        //     mainVM.receivedTotalACK(0);
        // }else if(obj.type == "receiveACK"){
        //     mainVM.isPHYMACAllRight(true);
        //     mainVM.receivedTotalACK(mainVM.receivedTotalACK() + 1);
        // }else if(obj.type == "error")
        //     mainVM.errors.push(obj.msg);
        // else if(obj.type == "unreachableHello")
        //     mainVM.isPHYMACAllRight(false);
        // else if(obj.type == "receiveHello")
        //     mainVM.isPHYMACAllRight(true);
        // else if(obj.type == "terminated")
        //     mainVM.isTerminated(true);
        // else if(obj.type == "ready")
        //     mainVM.isTerminated(false);
        // else if(obj.type == "restart")
        //     mainVM.isTerminated(true);
    };

    socket.onclose = function() {
        // mainVM.isConnectedToWS(false);
        // mainVM.errors.unshift("WebSocket connect - reconnecting...");

        connectToWS();
    }
}
