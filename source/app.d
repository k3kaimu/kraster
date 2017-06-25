import vibe.d;
import rest;
import ws;

immutable portNum = "8080";

shared static this()
{
	auto restsettings = new RestInterfaceSettings;
	restsettings.baseURL = URL("http://127.0.0.1:" ~ portNum ~ "/api");

	auto router = new URLRouter;

	router
	.registerRestInterface(new MyAPIImpl, restsettings)
	.get("/myapi.js", serveRestJSClient!MyAPI(restsettings))
	.get("*", serveStaticFiles("public/"));

	auto settings = new HTTPServerSettings;
	settings.port = portNum.to!ushort;
	settings.bindAddresses = ["::1", "127.0.0.1"];
	listenHTTP(settings, router);

	logInfo("Please open http://127.0.0.1:" ~ portNum ~ "/ in your browser.");
}
