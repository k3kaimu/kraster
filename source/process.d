module process;

import vibe.d;

import std.stdio;
import std.process;
import std.ascii;
import std.datetime;
import std.algorithm;
import std.string;
import std.range;
import std.array;
import std.conv;

auto waitPid(Pid pid, Duration dur = 1.seconds)
{
    while(1){
        auto res = tryWait(pid);
        if(res.terminated) return res;
        sleep(dur);
    }
}


struct JobState
{
    enum State : string
    {
        queue = "queue",
        running = "running",
    }

    string id;
    string username;
    string queue;
    string jobname;
    State state;
}


JobState[] getMyJobListNow()
{
    auto pipe = pipeShell("qstat -a");
    pipe.pid.waitPid(100.msecs);

    JobState[] jobs;
    foreach(line; pipe.stdout.byLine){
        if(line.length == 0) continue;
        if(!line[0].isDigit) continue;
        auto ss = line.splitter(" ").map!(chomp).filter!"!a.empty".array();
        JobState job;
        job.id = ss[0].dup;
        job.username = ss[1].dup;
        job.queue = ss[2].dup;
        job.jobname = ss[3].dup;
        job.state = ss[9] == "R" ? JobState.State.running : JobState.State.queue;
        jobs ~= job;
        writeln(ss);
    }

    writeln(jobs);
    return jobs;
}



struct ClusterState
{
    static struct NodeState
    {
        string nodeid;
        int jobs;
        int cpus;
        string[] users;
    }


    static struct UserState
    {
        string userid;
        int jobs;
        int runs;
        int cpus;
        string[] nodes;
    }


    NodeState[] nodes;
    UserState[] users;
}


ClusterState getClusterStateNow()
{
    auto pipe = pipeShell("/gpfs/work/my016/tool/qwatch.pl");
    pipe.pid.waitPid(100.msecs);

    ClusterState state;
    string[] lines = pipe.stdout.byLine.map!"a.idup".array();
    lines = lines[3 .. $];
    foreach(line; lines){
        if(!line.startsWith("wsnd")) break;
        
        ClusterState.NodeState node;
        auto ss = line.splitter(" ").map!(chomp).filter!"!a.empty".array();
        node.nodeid = ss[0];
        node.jobs = ss[1].to!int;
        node.cpus = ss[2].to!int;
        if(ss.length > 10)
            node.users = ss[12 .. $];

        state.nodes ~= node;
    }

    lines = lines.find!(a => a.startsWith("User ID"));
    lines = lines[2 .. $];
    foreach(line; lines){
        if(line.length == 0) continue;
        if(line[0] == '-') break;

        ClusterState.UserState user;
        auto ss = line.splitter(" ").map!(chomp).filter!"!a.empty".array();
        user.userid = ss[0];
        user.jobs = ss[1].to!int;
        user.runs = ss[2].to!int;
        user.cpus = ss[3].to!int;
        //user.nodes = ss[4].to!int;
        user.nodes = ss.retro.until!(a => !a.startsWith("wsnd")).array();
        user.nodes.reverse();

        state.users ~= user;
    }

    writeln(state);
    return state;
}
