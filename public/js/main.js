
$(function(){
    connectToWS();
});


function connectToWS()
{
    var hn = window.location.hostname;
    var pn = window.location.port;
    socket = new WebSocket("ws://" + hn +":" + pn +"/ws");

    socket.onopen = function(){
        mainVM.isConnectedToWS(true);
    };

    socket.onmessage = function(message) {
        console.log(message.data);
        var obj = JSON.parse(message.data);

        if(obj.type == "updateRecvImage")
            updateRecvImages();
        else if(obj.type == "updateSendImage")
            updateSendImages();
        else if(obj.type == "receiveDataFrame"){
            mainVM.isPHYMACAllRight(true);
            mainVM.totalFramesOfNowReceivedData(obj.totalFrames);
            mainVM.receivedLastFrameId(obj.frameId);
            mainVM.receivedImg("");
            mainVM.isOpenReceiveMonitorModal(true);
        }else if(obj.type == "receiveFullData"){
            mainVM.isPHYMACAllRight(true);
            mainVM.totalFramesOfNowReceivedData(obj.totalFrames);
            mainVM.receivedLastFrameId(obj.totalFrames);
            mainVM.receivedImg(obj.img);
        }else if(obj.type == "sendData"){
            mainVM.isPHYMACAllRight(true);
            mainVM.totalFramesOfNowSendingData(obj.totalFrames);
            mainVM.totalSizeOfNowSendingData(obj.size);
            mainVM.receivedTotalACK(0);
        }else if(obj.type == "receiveACK"){
            mainVM.isPHYMACAllRight(true);
            mainVM.receivedTotalACK(mainVM.receivedTotalACK() + 1);
        }else if(obj.type == "error")
            mainVM.errors.push(obj.msg);
        else if(obj.type == "unreachableHello")
            mainVM.isPHYMACAllRight(false);
        else if(obj.type == "receiveHello")
            mainVM.isPHYMACAllRight(true);
        else if(obj.type == "terminated")
            mainVM.isTerminated(true);
        else if(obj.type == "ready")
            mainVM.isTerminated(false);
        else if(obj.type == "restart")
            mainVM.isTerminated(true);
    };

    socket.onclose = function() {
        mainVM.isConnectedToWS(false);
        mainVM.errors.unshift("WebSocket connect - reconnecting...");

        connectToWS();
    }
}
