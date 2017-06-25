module ws;

import std.functional;

import vibe.d;
import process;


enum WebSocketEventType
{
    updateUserStatus,
    updateClusterStatus,
}


string makeWSEvent(T...)(WebSocketEventType tag, T nameAndData)
{
    Json obj = Json.emptyObject;
    obj["type"] = tag.to!string();

    foreach(i, ref e; nameAndData){
        static if(i % 2 == 0){
            static if(is(typeof(JSONValue(nameAndData[i+1]))))
                obj[nameAndData[i]] = nameAndData[i+1];
            else
                obj[nameAndData[i]] = nameAndData[i+1].to!string;
        }
    }

    return obj.toString();
}


void userStatusMonitoring(scope WebSocket socket)
{
    while(socket.connected){
        JobState[] jobs = getMyJobListNow();
        
        socket.send(makeWSEvent(WebSocketEventType.updateUserStatus,
            "data", jobs.serializeToJson()));
        
        sleep(10.seconds);
    }
}


void handleWebSocket(scope WebSocket socket)
{
	auto userStatusMonitoringWriter = runTask(toDelegate(&userStatusMonitoring), socket);

    userStatusMonitoringWriter.join();
}
