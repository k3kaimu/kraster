module rest;

import vibe.d;

@path("/")
interface MyAPI
{
	@path("qsub.json") @method(HTTPMethod.POST)
	string qsub(string jobcommad, string jsondata);

	@path("qdel.json") @method(HTTPMethod.PUT)
	bool qdel(string jobId);

	@path("qstat.json") @method(HTTPMethod.GET)
	string qstat();
}


final class MyAPIImpl : MyAPI
{
	this() {}


	string qsub(string jobcmmand, string jsondata)
	{
		return "0";
	}


	bool qdel(string jobId)
	{
		return false;
	}


	string qstat()
	{
		return "";
	}
}