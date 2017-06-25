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
            static if(is(typeof(nameAndData[i+1]) == Json))
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


void clusterStatusMonitoring(scope WebSocket socket)
{
    while(socket.connected){
        ClusterState state = getClusterStateNow();
        
        socket.send(makeWSEvent(WebSocketEventType.updateClusterStatus,
            "data", state.serializeToJson()));
        
        sleep(30.seconds);
    }
}


void onWSHandshake(scope WebSocket socket)
{
    auto userStatusMonitoringWriter = runTask(toDelegate(&userStatusMonitoring), socket);
    auto clusterStatusMonitoringWriter = runTask(toDelegate(&clusterStatusMonitoring), socket);

    userStatusMonitoringWriter.join();
    clusterStatusMonitoringWriter.join();
}
