module rest;

import std.process;
import std.range;

import vibe.d;

import process;


@path("/")
interface MyAPI
{
	@path("qsub.json") @method(HTTPMethod.POST)
	void qsub(string[] jobcommad);

	@path("qdel.json") @method(HTTPMethod.PUT)
	bool qdel(string jobId);

	@path("qdelALL.json") @method(HTTPMethod.PUT)
	bool qdelall();
}


final class MyAPIImpl : MyAPI
{
	this() {}


	void qsub(string[] jobcommands)
	{
		foreach(cmd; jobcommands){
			auto pipe = pipeShell("qsub", Redirect.stdin);
			{
				import std.stdio;
				auto writer = pipe.stdin.lockingTextWriter;
				.put(writer, cmd);
				writeln(cmd);
			}
			pipe.stdin.flush();
			pipe.stdin.close();
		}
	}


	bool qdel(string jobId)
	{
		auto pid = spawnShell("qdel " ~ jobId);
		pid.waitPid(100.msecs);
		return true;
	}


	bool qdelall()
	{
		auto pid = spawnShell("qdel ALL");
		pid.waitPid(100.msecs);
		return true;
	}
}
