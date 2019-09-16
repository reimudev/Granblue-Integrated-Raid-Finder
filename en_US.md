Repository for codes of the discontinued GBF chrome extension Granblue Integrated Raid Finder.

The structure of whole project is as depicted below:

![Project Structure](/en.jpg)

I have never authorized anyone, so any person interested in this program can modify and republish it without limitations.

Because codes are desensitized and several programs rely on specific directory structure (they are not deployed using Docker) to function normally, so you cannot run them as-is. Please figure out how to run these programs by yourself.

Known bugs:
* For a required paramter when calling GBF's APIs which should be a global auto-increment number according to some people I simply used a random number. This can be a vunerability and make this extension detected by anti-cheat codes.
* From time to time the server runs into a state which no incoming connections could be made (dmesg shows that new connection immediately receives a RST packet and my programs are totally unaware of this) or no incoming data can be received from twitter which causes long delay of raid data. This problem has never been solved.
