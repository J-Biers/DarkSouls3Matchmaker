using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Net;

namespace echoServer
{
    public class EchoServer
    {
        public HttpListener listener = new HttpListener();

        public static void Main(string[] args)
        {
            EchoServer server = new EchoServer();
        }

        public void Start()
        {
            //TODO: Start listening and echoing
        }
    }
}
