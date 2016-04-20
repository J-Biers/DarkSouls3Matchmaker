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

        private int port;

        public static void Main(string[] args)
        {
            EchoServer server = new EchoServer(22475);
            server.Start();
        }

        public EchoServer(int port)
        {
            //Construct echo server
            this.port = port;
        }

        public void Start()
        {
            //TODO: Start listening and echoing

            //Set the port number to be listening on
            listener.Prefixes.Add("http://*:" + port + "/");

            //Start listening
            listener.Start();
            while (listener.IsListening)
            {
                //Get a connection
                Console.WriteLine("Waiting for connection");

                HttpListenerContext context = listener.GetContext();

                //Display context information
                Console.WriteLine("Got connection.  Query: " + context.Request.QueryString.ToString());

                //Build a JSON object from the query string
                StringBuilder json = new StringBuilder();
                json.Append("{");
                foreach (string key in context.Request.QueryString.Keys)
                {
                    json.Append("\n\t");
                    json.Append(key);
                    json.Append(':');
                    json.Append(context.Request.QueryString[key]);
                }
                json.Append("\n}");

                //Send the json object
                byte[] buffer = Encoding.ASCII.GetBytes(json.ToString());
                context.Response.OutputStream.Write(buffer, 0, buffer.Length);

                //Close the connection
                context.Response.Close();
            }
        }
    }
}
