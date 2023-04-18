# JavaScript SDK

<!-- toc -->
- [Introduction](#introduction)
- [Flow Control](#flowcontrol)
    + [load.initialize(callback)](#loadinitializenamecallback)
    + [load.initialize(name, callback)](#loadinitializecallback)
    + [load.finalize(callback)](#loadfinalizecallback)
    + [load.finalize(name, callback)](#loadfinalizenamecallback)
    + [load.action(callback)](#loadactioncallback)
    + [load.action(name, callback)](#loadactionnamecallback)
- [WebRequest](#webrequest)
    + [(static) load.WebRequest.defaults : Object](#staticloadwebrequestdefaultsobject)
    + [constructor(options) : WebRequest](#constructoroptionswebrequest)
    + [Methods](#methods)
        + [sendSync() : WebResponse](#sendsyncwebresponse)
        + [send() : Promise](#sendpromise)
    + [MultipartBody](#multipartbody)
        + [constructor(entries, boundary) : MultipartBody](#constructorentriesboundarymultipartbody)
    + [MultipartBody.StringEntry](#multipartbodystringentry)
        + [constructor(name, value): StringEntry](#constructornamevaluestringentry)
    + [MultipartBody.FileEntry](#multipartbodyfileentry)
        + [constructor(name, filePath, contentType, fileName): FileEntry](#constructornamefilepathcontenttypefilenamefileentry)
- [WebResponse](#webresponse)
    + [Properties](#properties)
    + [Methods](#methods-1)
        + [textCheck(expression) : boolean](#textcheckexpressionboolean)    
- [WebSocket](#websocket)
	+ [constructor(options) : WebSocket](#constructoroptionswebsocket)
    + [Methods](#methods-2)
        + [open()](#open)
        + [send(data)](#senddata)
        + [send(options)](#sendoptions)
        + [close([code, reason])](#closecodereason)
        + [waitForData(timeout[ms]) : Promise](#waitfordatatimeoutpromise)		
        + [continue()](#continue)
        + [waitForClose(timeout[ms]) : Promise](#waitforclosetimeoutpromise)		
- [GrpcClient](#grpcclient)
    + [constructor(options) : GrpcClient](#constructoroptionsgrpcclient)
    + [Methods](#methods-3)
        + [unaryRequest(options) : GrpcUnaryRequest](#unaryrequestoptionsgrpcunaryrequest)
        + [clientStreamRequest(options) : GrpcClientStreamRequest](#clientstreamrequestoptionsgrpcclientstreamrequest)
        + [serverStreamRequest(options) : GrpcServerStreamRequest](#serverstreamrequestoptionsgrpcserverstreamrequest)
    + [GrpcUnaryRequest](#grpcunaryrequest)
        + [Methods](#methods-4)    
            + [sendSync() : GrpcResponse](#sendsyncgrpcresponse)
            + [send() : Promise](#sendasyncgrpcresponse)
    + [ClientStreamMethod](#clientstreammethod)
        + [Methods](#methods-5) 
            + [sendSync() : GrpcResponse](#sendsyncgrpcresponse-1)
            + [send() : Promise](#sendasyncgrpcresponse-1)
    + [ServerStreamMethod](#serverstreammethod)
        + [Methods](#methods-6)
            + [sendSync() : GrpcResponse](#sendsyncgrpcresponse-2) 
            + [send() : Promise](#sendasyncgrpcresponse-2)
- [GrpcResponse](#grpcresponse)
    + [Properties](#properties-1)        
- [Transaction](#transaction)
    + [constructor(name) : Transaction](#constructornametransaction)
    + [Properties](#properties-2)
    + [Methods](#methods-7)
        + [start()](#start)
        + [stop([status])](#stopstatus)
        + [set(status, duration)](#setstatusduration)
        + [update() : transaction](#updatetransaction)
- [Timer](#timer)
    + [constructor(callback, delay) : Timer](#constructorcallbackdelaytimer)
    + [Methods](#methods-8)
        + [stop](#stop)
        * [startTimeout](#starttimeouttimer)
        * [startInterval](#startintervaltimer)
        * [wait](#waitpromise)
- [global](#global)        
- [config](#config)
    + [Properties](#properties-3)
        + [user](#user)
        + [script](#script)
        + [host](#host)
        + [env](#env)
- [General Methods](#generalmethods)
    + [log(message, level)](#logmessagelevel)
    + [sleep(time)](#sleeptime)
    + [setUserCredentials(authenticationData)](#setusercredentialsauthenticationdata)
    + [setUserCertificate(certFilePath, keyFilePath, password)](#setusercertificatecertfilepathkeyfilepathpassword)
    + [exit(exitType, message)](#exitexittypemessage)
    + [unmask(maskedValue) : string](#unmaskmaskedvaluestring)
    + [decrypt(encryptedValue) : string](#decryptencryptedvaluestring)
    + [exec(options) : ExecutionResult | Promise<ExecutionResult>](#execoptionsexecutionresultpromiseexecutionresult)
- [Parameters](#parameters)
- [Extractors](#extractors)
    + [Use in WebRequest](#useinwebrequest)
    + [Extractor Types](#extractortypes)
        + [BoundaryExtractor(name, leftBoundary, rightBoundary) : ExtractorObject](#boundaryextractornameleftboundaryrightboundaryextractorobject)
        + [BoundaryExtractor(name, options) : ExtractorObject](#boundaryextractornameoptionsextractorobject)
        + [RegexpExtractor(name, expression, flags) : ExtractorObject](#regexpextractornameexpressionflagsextractorobject)
        + [RegexpExtractor(name, options) : ExtractorObject](#regexpextractornameoptionsextractorobject)
        + [JsonPathExtractor(name, path, returnMultipleValues) : ExtractorObject](#jsonpathextractornamepathreturnmultiplevaluesextractorobject)
        + [JsonPathExtractor(name, options) : ExtractorObject](#jsonpathextractornameoptionsextractorobject)
        + [XpathExtractor(name, path, returnMultipleValues) : ExtractorObject](#xpathextractornamepathreturnmultiplevaluesextractorobject)
        + [XpathExtractor(name, options) : ExtractorObject](#xpathextractornameoptionsextractorobject)
        + [TextCheckExtractor(name, text, scope) : ExtractorObject](#textcheckextractornametextscopeextractorobject)
        + [TextCheckExtractor(name, options) : ExtractorObject](#textcheckextractornameoptionsextractorobject)
        + [HtmlExtractor(name, querySelector, attributeName, returnMultipleValues) : ExtractorObject](#htmlextractornamequeryselectorattributenamereturnmultiplevaluesextractorobject)
        + [HtmlExtractor(name, options) : ExtractorObject](#htmlextractornameoptionsextractorobject)
        + [CookieExtractor(name, cookieName, domain, path) : ExtractorObject](#cookieextractornamecookienamedomainpathextractorobject)
        + [CookieExtractor(name, options) : ExtractorObject](#cookieextractornameoptionsextractorobject)
    + [Extractor results](#extractorresults)
- [Cookie](#cookie)
    + [constructor(options, mode) : Cookie](#constructoroptionsmodecookie)
- [Cookies](#cookies)
    + [addCookies(cookies)](#addcookiescookies)
    + [deleteCookies(cookies)](#deletecookiescookies)
    + [clearCookies()](#clearcookies)
- [utils](#utils)
    + [Methods](#methods-9)
        + [getByBoundary(source, leftBoundary, rightBoundary) : string](#getbyboundarysourceleftboundaryrightboundarystring)
        + [reportDataPoint(name, value)](#reportdatapointnamevalue)
        + [base64Encode(value, options) : string](#base64encodevalueoptionsstring)
        + [base64Decode(value, options) : string](#base64decodevalueoptionsstring)
        + [randomString(size, options) : string](#randomstringsizeoptionsstring)
        + [uuid() : string](#uuidstring)
        + [hash(algorithm, input, outputEncoding) : string](#hashalgorithminputoutputencodingstring)
        + [hash(input, options) : string](#hashinputoptionsstring)
        + [hmac(algorithm, secret, input, outputEncoding) : string](#hmacalgorithmsecretinputoutputencodingstring)
        + [hmac(input, options) : string](#hmacinputoptionsstring)
        + [samlEncode(value) : string](#samlencodevaluestring)
        + [totp(secret, timestamp) : string](#totpstring)
        + [totp(secret, timestamp, options) : string](#totpoptionsstring)
    + [Chain](#chain)
        + [constructor(function, options, . . ., function, options)](#constructorfunctionoptionsfunctionoptions)
        + [run(value) : any](#runvalueany)
- [net](#net)
    + [lookupService(service, protocol, domain) : string](#lookupService)
- [azure](#azure)
    + [getToken(vaultName, tenantId, clientId, clientSecret) : string](#getToken)
    + [getSecret(secret, token) : string](#getSecret)
- [VTS](#vts)
    + [vtsConnect(options) : VTSClient](#vtsconnectoptionsvtsclient)
    + [VTSClient](#vtsclient)
        + [Methods](#methods-10)
            + [getColumn(columnName) : VTSColumn](#getcolumncolumnnamevtscolumn)
            + [getRow(rowIndex) : VTSRow](#getrowrowindexvtsrow)
            + [createColumn(columnName) : VTSColumn](#createcolumncolumnnamevtscolumn)
            + [popColumns(columnNames) : Object](#popcolumnscolumnnamesobject)
            + [rotateColumns(columnNames, placementType) : Object](#rotatecolumnscolumnnamesplacementtypeobject)
            + [setValues(columnNames, values, placementType) : Object](#setvaluescolumnnamesvaluesplacementtypeobject)
            + [replaceExistingValue(columnNames, newValue, existingValue)](#replaceexistingvaluecolumnnamesnewvalueexistingvalue)
            + [searchRows(columnNames, values, delimiter) : Object](#searchrowscolumnnamesvaluesdelimiterobject)
    + [VTSColumn](#vtscolumn)
        + [Properties](#properties-4)
            + [client : VTSClient](#clientvtsclient)
        + [Methods](#methods-11)
            + [clear()](#clear)
            + [size() : Number](#sizenumber)
            + [createIndex()](#createindex)
            + [dropIndex()](#dropindex)
            + [addValue(value, ifUnique)](#addvaluevalueifunique)
            + [clearField(rowIndex)](#clearfieldrowindex)
            + [incrementField(rowIndex, value)](#incrementfieldrowindexvalue)
            + [getFieldValue(rowIndex) : string](#getfieldvaluerowindexstring)
            + [setFieldValue(rowIndex, value, existingValue)](#setfieldvaluerowindexvalueexistingvalue)
            + [pop() : string](#popstring)
            + [rotate(placementType) : string](#rotateplacementtypestring)
    + [VTSRow](#vtsrow)
        + [Properties](#properties-5)
            + [client : VTSClient](#clientvtsclient-1)
        + [Methods](#methods-12)
            + [clear()](#clear-1)
            + [getValues() : Object](#getvaluesobject)
            + [setValues(columnNames, values)](#setvaluescolumnnamesvalues)
- [File](#file)
    + [constructor(path) : File](#constructorpathfile)
    + [Methods](#methods-13)
        + [read(options): Object](#readoptionsobject)
        + [append(content)](#appendcontent)        
        + [write(content)](#writecontent)
        + [isExists() : boolean](#isexistsboolean)
<!-- tocstop -->

## Introduction

The following sections describe the various object, methods, and properties that are part
of the load testing JavaScript SDK. This section gives a brief summary of the concepts used throughout the new
SDK. If you're writing the script manually, make sure it uses UTF-8 encoding without BOM. A script file may contain three types of sections: _initialize_, _action_, and _finalize_. Each section may
appear more than once. The _initialize_ section is optional and is executed only once
at the beginning of the script. The _action_ section is mandatory (at least one instance of this section must exist)
and it is executed in iterations throughout the duration of the script. The _finalize_ section is optional
and is executed only once at the end of the script (when all the _action_ sections are finished running).


The following is a typical script that sends an HTTP request to a server and then uses some values from the
response to determine if the transaction around that HTTP request has passed.

```javascript

load.action("Main", () => { //(A)

  const productTransaction = new load.Transaction("Product"); //(B)

  productTransaction.start(); //(C)
  const myPageRequest = new load.WebRequest({ //(D)
      url: "http://myServer.com/main/product.html", //(E)
      method: "GET",
      returnBody: true,
      headers: {
            "Accept-Language": "en-US,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, sdch",
            "Accept": "*/*"
      },
      resources: [
      		"http://my.server.net/sources/Caching/oldnavy.css"
      ]
  });
  
  const myPageResponse = myPage.sendSync(); //(F)
  
  /*Expected result is :
   <html>
     <body>
       <h1>My product</h1>
       <span productId="12">Very nice product</p>
   
     </body>
   </html>
   */
  
  const productId = load.utils.getByBoundary(myPageResponse.body,'productId="','"'); //(G)
  if (productId === null){ //(H)
    productTransaction.stop(load.TransactionStatus.Failed);
  } else {
    productTransaction.stop(load.TransactionStatus.Passed);
  }
});
``` 

Let's understand what is happening here. In line **A** we declare a new action named "Main"* with a function
containing all the code that will be executed as part of this action.
Note that all the elements of the SDK are within the _load_ namespace (object) and therefore the ```load.``` prefix is needed
to access them. 

In line **B** we declare a new transaction named "Product" and store it in a variable called _productTransaction_.
This variable will allow us to obtain information about the transaction and perform operations on it. 

For example, in line **C** we start the transaction. Next we move on to declaring a web request via the WebRequest constructor in **D**.
The web request constructor takes an object that configures the web request (details on the properties of the options object below).

For example, **E** is the URL for the web request but you can also set the header, extra resources, and many more properties of the request.

In line **F** we send the request synchronously. The script now stops and waits for a response to be received and then stores the
response in a variable named _myPageResponse_.
Since we set the _returnBody_ property to ```true``` in the web request options, we can now access the full response
body and extract values from it. 

In line **G** we use the ```getByBoundary``` function to extract the product id from the
response and then use it in line **H** to determine if the "Product" transaction should fail or pass. 
 
*Currently the name is not used but it will be used in future versions for complex run logic.  

The following sections give a detailed view of all the ins and outs of the SDK.

## Flow Control

Functions which are responsible for the flow control of the lifecycle of a Vuser.

#### load.initialize(callback)
Registers the given _callback_ to be run in the initialize phase of the test.
The initializes will be run in the same order as they are registered by calls to ````load.initialize()````. 
The _callback_ may return a promise that will be used to determine if the callback has succeeded or failed.

```javascript
load.initialize(async function (){
   //This code will run during Vuser initialization 
});
```

#### load.initialize(name, callback)
Registers the given _callback_ as a named initialize of the script with the given _name_.
The initializes will be run in the same order as they are registered by calls to ````load.initialize()```` or as defined in the run logic.
The _callback_ may return a promise that will be used to determine if the callback has succeeded or failed.

```javascript
load.initialize("myFirstInitialize", async function (){
   //This code will run during Vuser initialization 
});
load.initialize("mySecondInitialize", async function (){
   //This code will run during Vuser initialization 
});
```

#### load.finalize(callback)
Registers the given _callback_ to be run in the finalize phase of the test.
The finalizes will be run in the same order as they are registered by calls to ````load.finalize()```` or as defined in the run logic.
The _callback_ may return a promise that will be used to determine if the callback has succeeded or failed.

```javascript
load.finalize(async function(){
   //This code will run during Vuser finalization 
});
```

#### load.finalize(name, callback)
Registers the given _callback_ as a named finalize of the script with the given _name_.
The finalizes will be run in the same order as they are registered by calls to ````load.finalize()```` or as defined in the run logic.
The _callback_ may return a promise that will be used to determine if the callback has succeeded or failed.

```javascript
load.finalize("myFirstFinalize", async function(){
   //This code will run during Vuser finalization 
});
load.finalize("mySecondFinalize", async function(){
   //This code will run during Vuser finalization 
});
```

#### load.action(callback)
Registers the given _callback_ to be run in the action phase of the test.
The actions will be run in the same order as they are registered by calls to ````load.action()````. 
The _callback_ may return a promise that will be used to determine if the callback has succeeded or failed.

```javascript
load.action(async function(){
  //This will run first during the run phase    
});
```

#### load.action(name, callback)
Registers the given _callback_ as a named action of the script with the given _name_.
The actions will be run in the same order as they are registered by calls to ````load.action()```` or as defined in the run logic.
The _callback_ may return a promise that will be used to determine if the callback has succeeded or failed.

```javascript
load.action("myFirstAction", async function(){
  //This will run first during the run phase    
});
load.action("mySecondAction",async function(){
  //This will run second during the run phase
});
```
## 

## WebRequest

An object that allows you sending web requests to the AUT. When creating a _WebRequest_ you
can pass an options objects with all the configuration you need for the request. Then you can send
the request in either asynchronous or synchronous way.

Example:
```javascript
    const jsonPage = new load.WebRequest({
        url: "http://myserver/cgi-bin/json/generate_json_simple.asp",
        method: "GET",
        returnBody: true
    });

    const jsonResponse = jsonPage.sendSync();
```

#### (static) load.WebRequest.defaults : Object
Returns an object that contains all the default options that will be used as options for
any **subsequent** calls to the WebRequest constructor.

Example:
```javascript
            load.WebRequest.defaults.method = "POST";
            const webRequest = new load.WebRequest("www.foo.bar");
            //webRequest.method === "POST"
```

#### constructor(options) : WebRequest
Creates a new WebRequest instance. The user may provide the _options_ argument
which will override any default options. The options must include at least a "url"
property which is mandatory, while all the other properties are optional. Alternatively,
you can call the constructor with a string argument and then this argument will be the url.

Currently supported options are:

* **url (string, mandatory)** - The url to which the request is sent.

* **method (string) [Default: "GET"]** - The HTTP method that will be used for the request. 

* **headers (object) [Default: {}]** - A key value store that maps the header name to its value. 

* **id (integer)** - The ID used to generate the corresponding snapshot file. 

* **returnBody (boolean) [Default: false]** - When true, the _body_ property of the ````WebResponse```` will be populated. Otherwise the _body_ property of the ````WebResponse```` will be set to ````null````.   

* **queryString (object) [Default: {}]** - A key value store that maps the query string options. You may specify
 more than one value per key using the array notation. 
 For example ``` { foo: "bar", baz: ["qux", "quux"], corge: "" }``` will result in the following query string
 ```"foo=bar&baz=qux&baz=quux&corge="```
    
* **body (string, object, or Buffer) [Default: ""]** - The body of the request if the method supports a body (e.g. POST, PUT, etc).
If a JSON object is provided, it is converted to a data string automatically upon send. 
For example, 
If body equals ```{"foo":"bar","bat":10}``` it is converted to ```foo=bar&bat=10```.
For request with content-type ```text\plain```:
If body equals ```{"foo":"bar","bat":10}``` and formDelimiter is a newline character (\r\n), it is converted to:
```foo=bar
bat=10
```
For request with content-type ```application/json```:
If body equals ```{"foo":"bar","bat":10}``` it is converted to ```'{"foo":"bar","bat":10}'```.
If the body is a Node.js Buffer then the body will be sent as binary data.

* **bodyPath (string)** - The path to a file whose content will be used as the body of the request. This can be a path relative to the
script directory or an absolute path. This property is only used if the _body_ property is not set. 

* **isBinaryResponse (boolean) [Default: false]** - When set to ```true``` the response body is returned as a binary Node.js Buffer. 

* **formDelimiter (string) [Default: "&"]** - The delimiter that will be used for form body fields separation.

* **forceAuthentication (boolean) [Default: false]** - When true, forces authentication header to be added to the request using the credentials provided by the ```load.setUserCredentials``` API. When false, wait for an HTTP 401 (unauthorized) before sending the credentials.

* **awsSigning (object)** - When defined ```WebRequest``` will be automatically signed with AWS Signature Version 4 using the credentials provided by the ```load.setUserCredentials``` API. 
 
  Available properties are:
    * region (string, mandatory) - AWS service region
    * service (string, mandatory) - AWS service name
    * sign (string, optional) - Determines how to authenticate requests - using Authorization header or Query Parameters.                                
      Can be one of:
        - ```header``` (default) -  Authorization header is added automatically before request call.
        - ```url``` -  Authentication information will be added to query string parameters.
    * disableURIPathEscaping (boolean, optional) - If true, disables automatic escaping of the URI path of the request for the signing. S3 is an example of a service that does not need additional escaping.
    * unsignedPayload (boolean, optional) - If true, request payload will not be signed
  
  For example ```{ region: "us-west-1", service: "sqs" }```
 
  For example adding signature to url ```{ region: "us-west-1", service: "sqs", sign: "url" }```

* **disableRedirection (boolean) [Default: false]** - When true, WebRequest redirects are not processed automatically.

* **resources (array) [Default: []]** - A list of resources that will be downloaded as part of the request. An element in the array
  can be a string, in this case it will be used as the url of the resources and the rest of the parameters (e.g. headers)
  will be the same as in the WebRequest.
  
* **handleHTTPError (string/function)** - Determines how HTTP errors will be handled. (see _sendSync_) 

* **extractors (array, object)** - An extractor object or an array of extractor objects to apply on the response of this ```WebRequest```. More information [here](#webrequestextractors). 

* **transactionName (string) [Default: nil]** - Associate a WebRequest with a transaction.
  When the Dynatrace AppMon flag is enabled in the Runtime Settings, the default behavior is to associate each WebRequest with the transaction with the latest start time (if a transaction exists). This transaction name is used to display the request in Dynatrace AppMon dashlets.
  To change this behavior, manually define a value for TransactionName, or disable for a single request by entering 
  an empty string: "".

* **charset (string) [Default: utf-8]** - Destination character set of encoded form values. For example: iso-8859-1, windows-1252
                                          The supported character sets are listed here: https://www.iana.org/assignments/character-sets/character-sets.xhtml

Example:
```javascript
const webRequest = new load.WebRequest({
  url:"www.url.com",
  method: "POST",
  id: 1
});

//If you don't need to change the method (default is "GET") then you can do

const webRequest = new load.WebRequest("www.url.com");

```

### Methods

#### sendSync() : WebResponse
The synchronous version of _send_. When called, the script execution is blocked until a response is returned. Returns the resulting _WebResponse_ object or
throws an exception if an error occurs and the error is not handled by the user via an error handler (see below).

HTTP errors are handled by setting the _handleHTTPError_ property of the _WebRequest_. 

The possible values are:

* **Function with the signature ```func(webResponse) : boolean```** - In this case the function will be called with the
WebResponse object received from the request. The user may change the received response and it will be returned from the 
call to _sendSync_. The function return value affects how the current iteration continues execution. 
In case the function returns ```false``` the iteration will continue running as usual. 
In any other case the iteration will end immediately.

* **A string** - In this case a log message will be printed with the given string and the iteration will continue as usual.

* **```null```**  (default) - The error is not handled, the current iteration will end.

Examples:

No error handling:
```javascript
const request = new load.WebRequest({
    url: "http://myhostname.com/webgui",
    method: "GET",
    headers: {
        "Referer": "",
        "Upgrade-Insecure-Requests": "1"
    }
});

const response = request.sendSync();
```

Handle Http error:
```javascript
const request = new load.WebRequest({
    url: "http://myhostname.com/cgi-bin/print_request.asp",
    method: "POST",
    headers: {
        "Referer": "http://myhostname.com/JSON/test_json.html",
        "Origin": "http://myhostname.com",
        "Upgrade-Insecure-Requests": "1",
        "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "email=geoffrey%40kent.zm&media=2012-11-17T04%3A51%3A06-08%3A00&author_id=32856507%40N32856507",
    handleHTTPError: (webResponse) => {
      if (webResponse.status === 404){
        return false; //We can continue, its fine
      }
    }
});

const response = request.sendSync();
```


#### send() : Promise

Sends the request to the defined URL (see constructor) and returns a promise which is 
resolved with a _WebResponse_ object or rejected with an unhandled error.

Example:

```javascript

const webRequest = new load.WebRequest("www.url.com");
webRequest.send().then(function(response) {
  //Do something with the response  
}).catch(function(error) {
  //Handle the error or throw it
});

```

It is possible to use the JavaScript Promise constructs to control the asynchronous nature of the requests.
For example, the following code sends 3 simultaneous requests:

```javascript
Promise.all([
    (new load.WebRequest("www.first.com")).send(),
    (new load.WebRequest("www.second.com")).send(),
    (new load.WebRequest("www.third.com")).send()
]).then((results)=>{
    //This will be called when all three requests return
    //Do something with all 3 results
});
```

### MultipartBody
You can send multipart web request by assigning the ```MultipartBody``` object as the body of a ```WebRequest```.

#### constructor(entries, boundary) : MultipartBody
Creates a multipart body object with the given _entries_. The optional _boundary_ argument will be used to separate the entries within the sent body.
The _entries_ array should contain any of the following entry objects:

### MultipartBody.StringEntry
Represents an entry of a single string.

#### constructor(name, value): StringEntry
Creates a string entry object based on the given _name_ and _value.

### MultipartBody.FileEntry
Represents a file entry within a multipart request.
 
#### constructor(name, filePath, contentType, fileName): FileEntry 
Creates a file entry object based on the given _name_ and _filePath_. You can specify
the content type via the _contentType_ argument. If content type was not specified ```text/plain``` will be used.
You can specify the file name of the sent file via the _fileName_ argument. If the file name
is not specified it will be extracted from the _filePath_ argument.

Example:

```javascript
 new load.WebRequest({
        url: "http://someHostName", 
        method: "POST",
        headers: {
            "Accept-Encoding": "gzip, deflate, sdch",
        },
        body: new load.MultipartBody([
                new load.MultipartBody.StringEntry("entry", "some text"),
                new load.MultipartBody.FileEntry("name_of_files",
                    "test.json",
                    "text/plain",  // Content-Type property, optional, default is 'text/plain'
                    "newFile.json" // filename property, optional, default is the file name
                )
            ],
            "---myBoundary---")// Boundary property, optional, randomly generated if not supplied
    }).sendSync();

```

Alternatively, you can use an array containing the type of the part (i.e. ```string``` or ```file```) and the rest of the relevant constructor arguments.
For example, the following two definitions are equivalent:

```javascript
new load.MultipartBody([
                new load.MultipartBody.StringEntry("myName", "myText")
                ]);
```
and
```javascript
new load.MultipartBody([
                ["string","myName", "myText"]
                ]);
```

## WebResponse

This object is returned as a WebRequest result. You do not need to create it on your own.

### Properties

* **status (number)** - The status code of the response

* **headers (object)** - A key value store of the headers in the response sent by the server

* **size (number)** - The size (in bytes) of the response

* **startTime (number)** - The UNIX timestamp in milliseconds of the engine time on which the request roundtrip has started.

* **duration (number)** - The request roundtrip time in milliseconds. Only main request roundtrip time without resources and without redirections.

* **body (string or Buffer)** - The body of the response. Note that the body is available only if the request had the property _returnBody_ set to ````true````. If the _isBinaryResponse_ property was set to ```true```, then the returned value is a Node.js Buffer object.

* **jsonBody (object)** - The body of the response as an object (only applicable when the body is a valid json). Note that jsonBody is available only if the request had the property _returnBody_ set to ````true````

* **request (WebRequest)** - The WebRequest object that caused this response to be generated

* **resources (array, object)** - A list of all the resources that were downloaded as part of the request.
Each resource object contains the following fields:
    * url (string) - The URL of the resource
    * status (number) - The status code that was returned when the resource was downloaded
    * size (number) - The size (in bytes) of the downloaded resource

* **redirectUrls (array)** - A list of all the URLs that passed through while redirecting to this response

* **extractors (object)** - The results of the extractor applied on the response. See [extractor results](#extractorresults) section for more details.

Example:
```javascript
const response1 = request1.sendSync(); //Create a WebResponse
load.log(response1.body); //print the response body to the console
load.log("Request startTime: " + new Date(response.startTime).toISOString(), load.LogLevel.info); // print request start time
```

### Methods
#### textCheck(expression) : boolean

Checks if the given _expression_ matches a substring within the body. _expression_ can be either a string or a
regular expression. Returns ````true```` if the _expression_ was found in the response body and ````false```` otherwise.
**Note:** _textCheck_ works only if the request had the property _returnBody_ set to ````true````

Example:
```javascript
 const response = request.sendSync();
 if (response.textCheck("Web Tours")){
   load.log("Success!");
 } else {
   load.log("Failure!");
 }
```

## WebSocket

An object that allows you create WebSocket connection to the AUT. When creating a _WebScoket_ you
need pass an options object with all the required configuration. You can then send and receive messages over the socket.

Example:
```javascript
	let messageHandler = function (message) {
      load.log(`Got message on ${socket.id}`, load.LogLevel.info);
    }
	
    const socket = new load.WebSocket({
        url: "ws://myserver:8080",
        onMessage: messageHandler
    });

    socket.open();
    socket.send("Ping", false);
    socket.send({dataPath: "c:\\myImg.png", isBinary: true});
    socket.close();
```

#### constructor(options) : WebSocket
Creates a new WebSocket instance. 
The mandatory _options_ argument must include at least the "url" and the "onMessage" properties, all the other properties are optional.

The supported options are:

* **url (string, mandatory)** - The WebSocket endpoint in ws:// or wss:// (secure WebSocket schema) format.

* **headers (object) [Default: {}]** - A key value store that maps the header name to its value.

* **onMessage (function, mandatory)** - A callback function for the "onMessage" event. 
The assigned function has the signature of ```func(message)```
where _message_ contains the following fields:
    * id (string) - A unique number indicating the connection number
    * data (string or Buffer) - The received message, if the message is binary it will be a Buffer object
    * size (number) - The size (in bytes) of the received message 
    * isBinaryData (boolean) - Indicates whether the received message is binary

* **onError (function)** - A callback function for the "onError" event. 
The assigned function has the signature of ```func(error)``` where _error_ is the
error message string

* **onOpen (function)** - A callback function for the "onOpen" event. 
The assigned function has the signature of ```func(message)```
where _message_ contains the following fields:
    * id (string) - The unique connection number
    * status (number) - The status code of the response
    * headers (object) - A key value store of the headers in the response sent by the server

* **onClose (function)** - A callback function for the "onClose" event. 
The assigned function has the signature of ```func(message)```
where _message_ contains the following fields:
    * id (string) - The unique connection number
    * code (number) - The connection close status code
    * reason (string) - The connection close reason
    * isClosedByClient (boolean) - Indicates whether the connection was closed by client


The created ```WebSocket``` instance has an automatically generated and unique _id_ (string) property indicating the connection number.

**Note:** The created ```WebScoket``` instance is not connected to the host. To initiate the connection, the _connect_ method must be called.

Example:
```javascript
	let messageHandler = function (message) {
      load.log(`Received message ${message.data}, socket id ${socket.id}`, load.LogLevel.info);
    }

    let errorHandler = function (err) {
        load.log('Socket error: ' + JSON.stringify(err), load.LogLevel.error);
    }

	let openHandler = function (response) {
      load.log(`Socket id: ${response.id} opened. Status: ${response.status}`, load.LogLevel.info);
    }

    let closeHandler = function (code) {
      load.log(`Socket id ${socket.id} closed, message: ${code}`, load.LogLevel.info);
    }

    const socket = new load.WebSocket({
        url: "ws://myserver:8080",
        onMessage: messageHandler,
        onError: errorHandler,
        onOpen: openHandler,
        onClose: closeHandler
    });

```

### Methods

#### open()
Opens the WebSocket connection to the remote host. After calling this function it is possible to send and receive messages.

Example:

```javascript
const socket = new load.WebSocket({
    url: "ws://ws.myhostname.com:8080",
    onMessage: (message)=>{ load.log(message.data); },
});

socket.open();
```

#### send(data)
Sends the _data_ to the connected server
In order to send a binary message, pass a Node.js Buffer object as _data_.

Example:

```javascript
const socket = new load.WebSocket({
    url: "ws://ws.myhostname.com:8080",
    onMessage: (message)=>{ load.log(message.data); },
});
socket.open();

socket.send("ping");
```

#### send(options)

* **data (string or Buffer, optional)** - message.

* **dataPath (string, optional)** - Path to a file that contains the data to send.

* **isBinary (boolean, default false)** - If _isBinary_ is set to true or a binary buffer is passed as _data_, the data is sent in a binary socket.

Sends the message specified in _data_ or the content of the file specified in _dataPath_ to the connected server.
_data_ argument and _dataPath_ property are mutually exclusive.
In case both _data_ argument and _dataPath_ property are specified, only _data_ argument will be considered
In order to send a binary message, _data_ must be a Node.js Buffer object.

Example:

```javascript
const socket = new load.WebSocket({
    url: "ws://ws.myhostname.com:8080",
    onMessage: (message)=>{ load.log(message.dataPath); },
});
socket.open();

socket.send({dataPath: "c:\\myImg.png", isBinary:true});
```

#### close(code, reason)
Closes the connection to the server.
If the optional _code_ and _reason_ arguments are provided, then the connection is closed with given code and reason.

Example:

```javascript
const socket = new load.WebSocket({
    url: "ws://ws.myhostname.com:8080",
    onMessage: (message)=>{load.log(message);},
});
socket.open();

socket.send("ping", false);
socket.close();
```

#### waitForData(timeout) : Promise
Returns a Promise that is resolved only when _continue_ is called on the WebSocket or when the _timeout_ has expired.
The _timeout_ is given in milliseconds (**Default:** 120000 milliseconds) use -1 for unlimited.
This function can be used to asynchronously wait until some other event happens in the system.
If the timeout expires before _continue_ has been called, the returned promise is rejected.

**Note:** Only one simultaneous call to _waitForData_ is allowed for each WebSocket.

Example:

```javascript
const socket = new load.WebSocket({
    url: "ws://ws.myhostname.com:8080",
    onMessage: (message) => {
        if (message.data === 'myMessage'){
          socket.continue();
        }
    },
});
socket.open();
socket.send("ping", false);
await socket.waitForData(6000);
socket.close();
```

#### continue()
Resolves a promise previously created by _waitForData_.

Example:

```javascript
const socket = new load.WebSocket({
    url: "ws://ws.myhostname.com:8080",
    onMessage: (message) => {
        if (message.data === 'myMessage'){
          socket.continue();
        }
    },
});
socket.open();
socket.send("ping", false);
socket.waitForData(60000);
socket.close();
```

#### waitForClose(timeout) : Promise
Blocks the Vuser script until the connection to the server is closed.
The _timeout_ is given in milliseconds (**Default:** 120000 milliseconds) use -1 for unlimited.
The optional __timeout__ argument is in milliseconds.

Closure can occur due to the following:
1. The server has closed the connection.
2. _close_ was called on the WebSocket.
3. The optional __timeout__ argument has passed and has expired.

Example:

```javascript
const socket = new load.WebSocket({
    url: "ws://ws.myhostname.com:8080",
    onMessage: (message) => {
        if (message.data === 'end'){
          socket.close();
        }
    },
});
socket.open();
socket.send("ping", false);
socket.waitForClose(30);
```

## GrpcClient

An object that creates a new client that can be used to make RPCs to a gRPC server.

Example:
```javascript
    const client = new load.GrpcClient({
        host: "myHost",
        isInsecure: true,
    });
```

#### constructor(options) : GrpcClient
Creates a new GrpcClient instance. The options must include at least a 'host' property, all other properties are optional.
Alternatively, you can call the constructor with a string argument, and then this argument will be the host.

Currently, supported options are:

* **host (string, mandatory)** - The host of the gRPC server.

* **isInsecure (boolean, optional) [Default: false]** - When true, an unencrypted, plain connection is established with gRPC server.

* **socket (string, optional) [Default: tcp]** - The communication socket that is used for RPC connection. Possible values are ```tcp```, which is default, or ```unix```.

* **ignoreBadCertificate (boolean, optional) [Default: true]** - When false, client verifies the server's certificate chain and host name during SSL connection.

* **certificateLocation (string, optional)** - The file path to client side certificate file. The files must contain PEM encoded data.

* **certificateKeyLocation (string, optional)** - The file path to client side certificate key file. The files must contain PEM encoded data.

* **defaults (object, optional)** - The object that contains all the default options that will be used as options for any client methods.

Example:
```javascript
    const client = new load.GrpcClient({
        host: "myHost",
        isInsecure: true,
        defaults: {
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363"
			}
		}
    });

    const client = new load.GrpcClient('myHost');
```

### Methods

#### unaryRequest(options) : GrpcUnaryRequest
Creates new gRPC unary service method object instance. The user may provide the _options_ argument,
which will override any client default options. 

Currently supported options are:

* **method (string, mandatory)** - A fully-qualified method name in 'package.Service/method' or 'package.Service.Method' format.  

* **protoFile (string, mandatory)** - The path to the protocol buffer .proto file.

* **id (integer, optional)** - The gRPC request ID. 

* **headers (object, optional) [Default: {}]** - A key value store that maps the header name to its value, gRPC metadata.

* **returnBody (boolean, optional)** - When true, the _body_ property of the ````GrpcResponse```` will be populated. Otherwise the _body_ property of the ````GrpcResponse```` will be set to ````null````.   
    
* **body (string or object, optional) [Default: ""]** - The body of the method call.

* **bodyPath (string, optional)** - The path to a file whose content will be used as the body of the request. This can be a path relative to the
script directory or an absolute path. This property is only used if the _body_ property is not set. 

* **extractors (array, object, optional)** - An extractor object or an array that holds extractor objects to apply on the response of this ```GrpcRequest```. More information [here](#webrequestextractors).

Example:
```javascript
const client = new load.GrpcClient('myHost');
const helloMethod = client.unaryRequest({
        id: 1,
		method: "package.Service.Hello",
		protoFile: "./proto/hello.proto"
	});
const response = helloMethod.sendSync();
```

#### clientStreamRequest(options) : GrpcClientStreamRequest
Creates new gRPC client stream service method object instance. The user may provide the _options_ argument,
which will override any client default options.

Currently supported options are:

* **method (string, mandatory)** - A fully-qualified method name in 'package.Service/method' or 'package.Service.Method' format.  

* **protoFile (string, mandatory)** - The path to the protocol buffer .proto file.

* **id (integer, optional)** - The gRPC request ID. 

* **headers (object, optional) [Default: {}]** - A key value store that maps the header name to its value, gRPC metadata.

* **returnBody (boolean, optional)** - When true, the _body_ property of the ````GrpcResponse```` will be populated. Otherwise the _body_ property of the ````GrpcResponse```` will be set to ````null````.   
    
* **bodyArray (array, object, optional)** - The body of the method call.

* **bodyPath (string, optional)** - The path to a file whose content will be used as the body of the request. This can be a path relative to the
script directory or an absolute path. This property is only used if the _body_ property is not set. 

* **extractors (array, object, optional)** - An extractor object or an array of extractor objects to apply on the response of this ```GrpcRequest```. More information [here](#webrequestextractors).

Examples:
```javascript
const client = new load.GrpcClient('myHost');
const recordRoute = client.clientStreamRequest({
        id: 3,
		method: "routeguide.RouteGuide.RecordRoute",
		protoFile: "./proto/route_guide.proto",
		bodyArray: [{
			"latitude": 407838351,
			"longitude": -746143763
		},
		{
			"latitude": 415736605,
			"longitude": -742847522
		}]
	});
const response = recordRoute.sendSync();
```

#### serverStreamRequest(options) : GrpcServerStreamRequest
Creates new gRPC server stream service method object instance. The user may provide the _options_ argument,
which will override any client default options.

Currently supported options are:

* **method (string, mandatory)** - A fully-qualified method name in 'package.Service/method' or 'package.Service.Method' format.

* **protoFile (string, mandatory)** - The path to the protocol buffer .proto file.

* **id (integer, optional)** - The gRPC request ID.

* **headers (object, optional) [Default: {}]** - A key value store that maps the header name to its value, gRPC metadata.

* **returnBody (boolean, optional)** - When true, the _body_ property of the ````GrpcResponse```` will be populated. Otherwise the _body_ property of the ````GrpcResponse```` will be set to ````null````.

* **body (string or object, optional) [Default: ""]** - The body of the method call.

* **bodyPath (string, optional)** - The path to a file whose content will be used as the body of the request. This can be a path relative to the
  script directory or an absolute path. This property is only used if the _body_ property is not set.

* **extractors (array, object, optional)** - An extractor object or an array that holds extractor objects to apply on the response of this ```GrpcRequest```. More information [here](#webrequestextractors).

Example:
```javascript
const client = new load.GrpcClient('myHost');
const lotsOfReplies = client.serverStreamRequest({
      id: 1,
      method: "hello.HelloService.LotsOfReplies",
      protoFile: "./proto/hello.proto",
      body: {
        "greeting": `DevWeb hello`
      },
      extractors: [
        new load.JsonPathExtractor("myReply", "$[0].reply")
      ],  
	});
const response = lotsOfReplies.sendSync();
```

## GrpcUnaryRequest
Creates unary RPC request object. 

### Methods

#### sendSync() : GrpcResponse
Performs unary RPC to a gRPC server. When called, the script execution is blocked until a response or error is returned. 
Returns the resulting _GrpcResponse_ object or throws an exception. 

Examples:
```javascript
const client = new load.GrpcClient('myHost');
const helloMethod = client.unaryRequest({
        id: 1,
		method: "package.Service.Hello",
		protoFile: "./proto/hello.proto"
	});

const response = helloMethod.sendSync();
```
#### send() : Promise
Performs async unary RPC to a gRPC server and returns a promise which is resolved
with a _GrpcResponse_ object or rejected with an unhandled error.

Examples:
```javascript
const client = new load.GrpcClient('myHost');
const helloMethod = client.unaryRequest({
    id: 1,
    method: "package.Service.Hello",
    protoFile: "./proto/hello.proto"
});

helloMethod.send().then(function(response) {
    //Do something with the response  
}).catch(function(error) {
    //Handle the error or throw it
});
```
## GrpcClientStreamRequest
Creates client streaming RPC request object. 

### Methods

#### sendSync() : GrpcResponse
Performs gRPC client streaming RPC to a gRPC server. When called, the script execution is blocked until a response or error is returned. 
Returns the resulting _GrpcResponse_ object or throws an exception. 

Examples:
```javascript
const client = new load.GrpcClient('myHost');
const route = client.clientStreamRequest({
        id: 1,
        method: "routeguide.RouteGuide.RecordRoute",
		protoFile: "./proto/route_guide.proto",
		bodyArray: [{
			"latitude": 407838351,
			"longitude": -746143763
		},
		{
			"latitude": 415736605,
			"longitude": -742847522
		}],
	});

const response = route.sendSync();
```

#### send() : Promise
Performs async gRPC client streaming to a gRPC server and returns a promise which is resolved
with a _GrpcResponse_ object or rejected with an unhandled error.

Examples:
```javascript
const client = new load.GrpcClient('myHost');
const route = client.clientStreamRequest({
        id: 1,
        method: "routeguide.RouteGuide.RecordRoute",
		protoFile: "./proto/route_guide.proto",
		bodyArray: [{
			"latitude": 407838351,
			"longitude": -746143763
		},
		{
			"latitude": 415736605,
			"longitude": -742847522
		}],
	});

route.send().then(function(response) {
    //Do something with the response  
}).catch(function(error) {
    //Handle the error or throw it
});
```

## GrpcServerStreamRequest
Creates server streaming RPC request object.

### Methods

#### sendSync() : GrpcResponse
Performs gRPC server streaming RPC to a gRPC server. When called, the script execution is blocked until a response or error is returned.
Returns the resulting _GrpcResponse_ object or throws an exception.

Examples:
```javascript
const client = new load.GrpcClient('myHost');
const features = client.serverStreamRequest({
        id: 1,
        method: "routeguide.RouteGuide.ListFeatures",
		protoFile: "./proto/route_guide.proto",
        body: {
            "lo": { "latitude":"407838351", "longitude":"-746143763" },
            "hi": { "latitude":"413700272", "longitude":"-742135189" }
        }
	});

const response = features.sendSync();
```

#### send() : Promise
Performs async gRPC server streaming to a gRPC server and returns a promise which is resolved
with a _GrpcResponse_ object or rejected with an unhandled error.

Examples:
```javascript
const client = new load.GrpcClient('myHost');
const features = client.serverStreamRequest({
        id: 1,
        method: "routeguide.RouteGuide.ListFeatures",
		protoFile: "./proto/route_guide.proto",
        body: {
            "lo": { "latitude":"407838351", "longitude":"-746143763" },
            "hi": { "latitude":"413700272", "longitude":"-742135189" }
        }
	});

features.send().then(function(response) {
    //Do something with the response  
}).catch(function(error) {
    //Handle the error or throw it
});
```

## GrpcResponse

This object is returned as a GrpcRequest result. You do not need to create it on your own.

### Properties

* **status (string)** - The status code of the response.

* **headers (object)** - A key value store of the gRPC metadata sent by the server.

* **size (number)** - The size (in bytes) of the response.

* **startTime (number)** - The UNIX timestamp in milliseconds when the RPC began.

* **duration (number)** - The invoke roundtrip time in milliseconds.

* **body (string)** - The body of the response. Note that the body is available only if the request had the property _returnBody_ set to ````true````

* **jsonBody (object)** - The body of the response as an object (only applicable when the body is a valid json). Note that jsonBody is available only if the request had the property _returnBody_ set to ````true````

* **extractors (object)** - The results of the extractor applied on the response. See [extractor results](#extractorresults) section for more details.

Example:
```javascript
const client = new load.GrpcClient('myHost');
const helloMethod = client.unaryRequest({
        id: 1,
		method: "package.Service.Hello",
		protoFile: "./proto/hello.proto"
	}).sendSync();
load.log(helloMethod.status); 
load.log("Invoke startTime: " + new Date(helloMethod.startTime).toISOString(), load.LogLevel.info); // print invoke start time
```


## Transaction

Transactions are the means to measure the time it takes to execute certain, well defined, 
parts of the script

#### constructor(name) : Transaction

Creates a new transaction with the given _name_.
**Note:** The created transaction has the "NotStarted" state and you must call the ```start()```
method explicitly to start it.

### Properties

* **name (string)**  - Always set. The name (not empty) of the transaction as it was passed to the constructor

* **state (string)** - Always set. Can be one of:
  - ```load.TransactionState.NotStarted``` - After the transaction is created but not yet started.
  - ```load.TransactionState.InProgress``` - After the transaction was started but not yet ended.
  - ```load.TransactionState.Ended``` - After the transaction has ended.
* **startTime (number)** - Set on call to _start_. The UNIX timestamp in milliseconds of the engine time on which the transaction has started.
* **duration (number)** - Set on call to _stop_, _set_, or _update_ . The number of milliseconds passed since the call to _start_ until the transaction was ended either by a call to _end_ or by the engine.
* **status (string)** - Always set but you may need to call _update_ to get the updated value. 
The current status of the transaction, can be one of:
    - ```load.TransactionStatus.Passed``` - If the transaction is currently considered passed.
    - ```load.TransactionStatus.Failed``` - If the transaction is currently considered failed.

Example:
```javascript
let transaction = new load.Transaction("My Transaction");
```

### Methods

#### start()

Starts the transaction and changes its _status_ to "InProgress".

Example:
```javascript
let transaction = new load.Transaction("My Transaction");
transaction.start();
```

#### stop([status])

Stops the transaction and changes its status to the current status of the transaction.
If the optional _status_ argument is provided then the stopped transaction will have the given
status and not the current transaction status. The valid values for _status_ are "Passed" and "Failed"
and can be taken from ```load.TransactionStatus.Passed``` and ````load.TransactionStatus.Failed````. 
Calling _stop_ records the transaction duration in the _duration_ property.

Example:
```javascript
let transaction = new load.Transaction("My Transaction");
transaction.start();
// ... later ...
transaction.stop();
//transaction.duration is now assigned with the duration
```

#### set(status, duration)

Sets the transaction _status_ and _duration_ to the given arguments.
The given _status_ must be one of "Passed"/"Failed" (from load.TransactionStatus) and the given
_duration_ must be a non-negative number of milliseconds for the transaction duration. 
Note that you cannot call _set_ on a started transaction.

Example:
```javascript
let transaction = new load.Transaction("My Transaction");

transaction.set(load.TransactionStatus.Passed, 1000);
//The transaction is now considered successful and the duration is 1 second
//transaction.duration is now assigned with the duration
```

#### update() : transaction

Updates the _status_, _state_, and _duration_ properties of the transaction object.
The transaction must be either started or ended for the call to succeed. 
Returns the transaction object for piping.

Example:
```javascript
let transaction = new load.Transaction("My Transaction");
transaction.start();
// ... later ...
transaction.update();
if (transaction.duration > 2000) {
   transactionStatus = load.TransactionStatus.Failed;
}
transaction.stop(transactionStatus);

```

## Timer

An object that allows you to create a timer that fires after a specified delay. The timer can fire once, or every time the specified delay has passed, until it is stopped.

Example:
```javascript
load.action("Action", async function () {
    let counter = 0;
    let timer = new load.Timer(() => {
        load.log(counter + ": timer [" + timer.id + "] called", load.LogLevel.info);
        if (counter === 8) {
            load.log("timer expired", load.LogLevel.info);
            timer.stop();
        }
        counter++;
    }, 1000);
    timer.startInterval();
    await timer.wait();
});
```

#### constructor(callback, delay): Timer;

Creates a new timer that will call the given _callback_ function after, at least, _delay_ milliseconds.
It is possible to make the timer call the callback only once, or consecutively, using the appropriate methods.

### Methods:

#### stop()

Stops the timer.

Example:
```javascript
    load.action("Action", async function () {
        let timer = new load.Timer(() => {
                timer.stop();
        }, 5000);
        timer.startTimeout();
        await timer.wait();
    });
```

#### startTimeout(): Timer;

Starts a timer that will call the _callback_ when the time (in milliseconds) has passed.

Each call to ```timer.startTimeout()``` must we followed by ```timer.wait()``` or there may be undefined behaviour when the timer delay has elapsed.
For example, the iteration might end before the timer fired.

Example:
```javascript
    load.action("Action", async function () {
        let counter = 0;
        let timer = new load.Timer(() => {
        }, 1000);
        timer.startTimeout();
        await timer.wait();
    });
```

#### startInterval(): Timer;

Starts a timer and sets it to call the callback each time the delay (in milliseconds) has passed.

Each setTimeout must we followed by _timer.wait()_ or there may be undefined behaviour when the timer is used.
For example, the iteration might end before the timer fired.

Example:
```javascript
    load.action("Action", async function () {
        let counter = 0;
        let timer = new load.Timer(() => {
            if (counter === 4) {
               timer.stop();
            }
            counter++;
        }, 5000);
        timer.startInterval();
        await timer.wait();
    });
```

#### wait(): Promise;

Waits for the timeout or interval timer to finish before allowing the iteration to continue.
It **must** be accompanied by _await_, since it returns a promise.

Example:
```javascript
    load.action("Action", async function () {
        let counter = 0;
        let timer = new load.Timer(() => {}, 5000);
        timer.startTimeout();
        await timer.wait();
    });
```

## Rendezvous
The rendezvous function creates a rendezvous point in a DevWeb script.
When this statement is executed the Vuser stops running and waits for permission to continue.
This function can only be used in an action section, and not in an initialize or finalize sections.
This capability is available for LRC\LRP execution only.

```javascript
    load.action("Action", async function () {
        load.rendezvous("rendezvous_name")
    });
```

## global
While we don't allow changing the properties of the _load_ object, we have provided a global object for you
to store your data. You can access this object via the ```load.global``` property

Example:
```javascript
  load.global.myData = 1;

// in another file ...
 
 load.log(`The value of myData is ${load.global.myData}`); 
  
```

## config
A global configuration object that is used to supply various configuration data to the running Vuser.

### Properties
#### user

A set of properties of the currently running Vuser:

* **userId (number)** - The ID of the currently running Vuser.
* **args (object)** - Map of key-value supplied for command line arguments.

Example:
```javascript
  load.config.user.userId;     //1 for the first user
  
  load.config.user.args["key1"];      //will return the value of key1 or undefined if not supplied
  //OR
  load.config.user.args.key1;      //will return the value of key1 or undefined if not supplied
```

#### script

* **name (String)** - The name of the script itself that this Vuser runs.
* **directory (String)** - The directory path to the script that this Vuser runs.
* **fullPath (String)** - The full path to the script that this Vuser runs.

Example:
```javascript
  load.config.script.name;       // ‘MyScript’ if the script is located in C:\scripts\MyScript
  load.config.script.directory;  // ‘C:\scripts\MyScript’ if the script is located in C:\scripts\MyScript
  load.config.script.fullPath;   // ‘C:\scripts\MyScript\main.js’ if the script is located in C:\scripts\MyScript
```

#### host

A set of properties of the host machine that runs the script.

* **name (String)** - The name of the machine running the current Vuser
* **platform (String)** - The machine platform of the current Vuser

Example:
```javascript
    load.config.host.name;   // The name of the machine running the script
    load.config.host.platform; // win32 (for Windows), darwin (for iOS), linux (for Linux)
```

#### env

An object that contains all the environment variables as key value pairs.  
**Note:** The keys are case-sensitive, including on Windows.

Example:
```javascript
    load.config.env.Path;   // The path of the machine that runs this Vuser
```

#### runtime

Runtime properties of the Vuser script

* **iteration (Number)** - The number of the currently running iteration

Example:
```javascript
    load.config.runtime.iteration;   // Vuser iteration number
```

## General Methods

#### log(message, level)
The log function writes a message to the Vuser log. The optional _level_ argument can be one of:
```LogLevel.error```, ```LogLevel.warning```, ```LogLevel.info```, ```LogLevel.debug```, ```LogLevel.trace```.
If _level_ is not specified or not one of the above options, ```LogLevel.info``` is used.

Please avoid using ```console.log``` as it is not supported.

Example:
```javascript
   load.log("This will be written to the log", load.LogLevel.debug);
```

#### sleep(time) 
alias: ```thinkTime```

Pauses the running of the script for the given number of seconds (time can have fractional part to simulate milliseconds)

Example:
```javascript
   load.sleep(10.5); //Will pause the script for 10 seconds and 500 milliseconds
```

#### setUserCredentials(authenticationData)
A function that allows you to specify authentication parameters for HTTP requests that
require authentication.
The _authenticationData_ can be either an authentication record or an array of authentication records.
All subsequent requests will try to apply the given authentication data to any request that requires 
authentication.

An authentication record has the following structure:

* **username (string, mandatory)** - The username for the authentication protocol.

* **password (string, mandatory)** - The password for the authentication protocol.

* **domain (string, optional)** - The domain for which this authentication record is applicable.

* **host (string, mandatory)** - A string specifying the host(s) to which this authentication record is applied. 
It may contain a * to indicate any alphanumeric string. You may specify this field as * to match any host.
The _host_ field is the key of the authentication record. Therefore, creating a new authentication record with the same
host will overwrite the previous one. If two authentication records match the same host (via *) the first one registered 
will be used.

Example:

```javascript
load.setUserCredentials({
    username: "loader",
    password: "runner",
    host:"*",
});
 
load.setUserCredentials([
  {
    username: "jhon",
    password: "smith",
    domain:"mydomain",
    host:"^mfs1*"
},{
    username: "jhon",
    password: "doe",
    domain:"mydomain",
    host:"^mfs2*"
}
])
```

### AWSAuthentication
You can set AWS credentials by passing the ```AWSAuthentication``` object to  ```setUserCredentials``` function.

#### constructor(providerType, options) : AWSAuthentication
Creates a AWS authentication credentials object. The _providerType_ argument is a string and can be one of: 

* "static" (```load.AWSProviderType.Static```) - AWS static credentials type provider.
The _options_  argument has the following properties:
    * accessKeyID (string) - AWS Access key ID
    * secretAccessKey (string) - AWS Secret Access Key
    * sessionToken (string, optional) - AWS Session Token

* "env" (```load.AWSProviderType.Env```) - Credentials retrieved from the environment variables of the running process.
    Environment variables used: 
        * Access Key ID: AWS_ACCESS_KEY_ID or AWS_ACCESS_KEY
        * Secret Access Key: AWS_SECRET_ACCESS_KEY or AWS_SECRET_KEY
        * Session Token: AWS_SESSION_TOKEN
The _options_ argument does not need to be provided.

* "shared" (```load.AWSProviderType.Shared```) - Credentials retrieved from shared credentials file.
The _options_ argument has the following properties:
    * fileName (string, optional) - Path to the shared credentials file.
      If empty will look for "AWS_SHARED_CREDENTIALS_FILE" env variable. 
      If the env value is empty will default to current user's home directory. 
    	  Linux/OSX: "$HOME/.aws/credentials"
    	  Windows:   "%USERPROFILE%\.aws\credentials"
    * profile (string, optional) - AWS Profile to extract credentials from the shared credentials file.  
      If empty will default to environment variable "AWS_PROFILE" or "default" if environment variable is also not set.
    
Example:
```javascript
   load.setUserCredentials(new load.AWSAuthentication(load.AWSProviderType.Static, {
   		accessKeyID: "myKey",
   		secretAccessKey: "mySecret",
   	}));

    load.setUserCredentials(new load.AWSAuthentication(load.AWSProviderType.Env));

    load.setUserCredentials(new load.AWSAuthentication(load.AWSProviderType.Shared, {
        fileName: "example.ini",
    }));
```

#### setUserCertificate(certFilePath, keyFilePath, password)
A function that allows you to specify certificate and key file path for HTTPS requests 
that require a certificate. The files must contain PEM encoded data.
The _password_ argument is optional and will be used to read password protected PEM file.
All subsequent requests will try to use the given certificate to any request that require
a certificate.

Example:
```javascript
   load.setUserCertificate("./cert.pem", "./key.pem");
   load.setUserCertificate("./cert.pem", "./key.pem", "myPass");
```

#### exit(exitType, message)
A function that allows you to stop the execution of the script. The _exitType_ argument is a string and can be one
of: 

* "iteration" (```ExitType.iteration```) - will stop the current iteration and continue to the next one after performing pacing.
* "stop" (```ExitType.stop```) - will stop the current iteration and try to run the finalization section of the script, then exit.
* "abort" (```ExitType.abort```) - will abort the execution of the script for the current Vuser (will not try to execute finalization).

You may specify an optional _message_ argument which will be printed to the log.

Note: Calling _exit_ from an asynchronous callback is not supported and will be ignored by the engine.

Example:

```javascript
   load.log("Before Exit");
   load.exit("stop"); //Can also use load.exit(load.ExitType.stop);
   load.log("After Abort"); //This message will not be shown!
````   

#### unmask(maskedValue) : string
A function that allows you to unmask masked value. The _maskedValue_ argument is a string generated using DevWebUtils executable.

**Note:** Masking is not secure and anyone is able to unmask it.

Example: 

```javascript
const request = new load.WebRequest({
    url: "http://someHostName",
    headers: {
        "x-secret-key": load.unmask("Tm90IHRoZSBwYXNzd29yZA==")
    }
});

const response = request.sendSync();
```

#### decrypt(encryptedValue) : string
A function that allows you to decrypt encrypted value. The _encryptedValue_ argument is an encrypted string generated using DevWebUtils executable.

**Note:** During runtime encryption key file should be supplied.

Example: 

```javascript
const request = new load.WebRequest({
    url: "http://someHostName",
    headers: {
        "x-secret-key": load.decrypt("Tm90IHRoZSBwYXNzd29yZA==")
    }
});

const response = request.sendSync();
```

### exec(options) : ExecutionResult | Promise<ExecutionResult>
Executes a shell command with the permissions of the DevWeb process.
Returns either an _ExecutionResult_ object for the synchronous version or a Promise that is resolved with the _ExecutionResult_ object 
for the asynchronous version.
The _options_ argument is an object that has the following properties:

* **command (string, mandatory)** - The executable file to run.

* **isAsync (bool, default: false)** - If set to ```true``` a Promise will be returned. The Promise is resolved with the _ExecutionResult_ when the process exists.

* **args (array of string, optional)** - The command line arguments for the executable.

* **returnOutput (bool, default: false)** - If set to ```true``` the standard output will be returned to the vuser script (false by default to reduce memory footprint).

* **returnError (bool, default: false)** - If set to ```true``` the standard errors output will be returned to the vuser script (false by default to reduce memory footprint).

* **env (array of string, optional)** - Additional environment variables to define for the created process in the format "key=value".

* **cwd (string, optional)** - The working directory of the created process. 

* **input (string, optional)** - The input the created process will read from the standard input.

The _ExecutionResult_ object returned has the following properties:

* **exitCode (number)** - The exit code of the created process.

* **output (string)** - The standard output of the created process. It will be available only if _returnOutput_ was set to true.

* **error (string)** - The standard error of the created process. It will be available only if _returnError_ was set to true.

* **message (string)** - The error message returned from the created process. It will be available only if the exit code is not 0.

You can use the short version of the function that has the signature: ```exec(command, args):ExecutionResult``` (see examples)

If an error occurs during the execution of the external command, an exception is thrown. In this case the _ExecutionResult_ object
is sent on the _content_ property of the exception. 
Example: 

```javascript
load.exec("notepad.exe",["myFile.txt"]);

const result = load.exec({
 command: "cmd.exe",
 args: ["/c","dir"],
 returnOut: true
})

if (result.exitCode === 0) {
 load.log(`The files are ${result.output}`);
} else {
 load.log(`Error running dir ${result.message}`,load.LogLevel.error);
}

const bgPromise = load.exec({
   command: "backgroundCalculation.exe",
   isAsync: true
});
// ... rest of script ...
// at the end of the script:
await bgPromise;

await load.exec({
   command: "always_error.exe",
   isAsync: true
}).catch((error)=>{
  load.log(`The standard error data is ${error.content.error}`);
});
```

## Parameters

Parameters are values generated during runtime by the runtime engine and are exposed to the script
 through the ````load.params```` variable. Each time you use a parameter variable, the next value will
 be loaded automatically based on the next value selection strategy in the parameters definition file (see next section).

See the DevWeb runtime engine documentation for more information on defining parameters.

Example:

```javascript

var paramValue = load.params.myParam1;
var nextParamValue = load.params.myParam1; //if nextValue is "always" this will be a new value
var someString = `The value of myParam1 is ${load.params.myParam1}`; //You can put it in a string with the standard JavaScript syntax

```

## Extractors

### Use in WebRequest
You may specify which values are extracted from the response of a specific ```WebRequest``` by providing the
```extractors``` option parameter. This parameter is an array of extractor objects
which are created using the following helper constructor functions:


### Extractor Types

#### BoundaryExtractor(name, leftBoundary, rightBoundary) : ExtractorObject
This constructor will create an extractor object for the boundary extractor.
It will search the headers and the body of the response for any string that begins with _leftBoundary_ and terminates
with _rightBoundary_, and return the first matching string between the two boundaries. If nothing is found then
```null``` is returned. For additional options please use the next constructor version.

#### BoundaryExtractor(name, options) : ExtractorObject
Creates the same ```ExtractorObject``` as in the previous call but allows some extra options.
_options_ can include:

* **leftBoundary (string, mandatory)** - The left boundary of the search.

* **rightBoundary (string, mandatory)** - The right boundary of the search.

* **occurrence (string/number, optional)** - The occurrence (previously Ordinal) of the result to return.
If _occurrence_ is not defined then the first occurrence is returned.
If _occurrence_ is set to a number, than the result with the given number index is returned.
If _occurrence_ is set to ```load.ExtractorOccurrenceType.All``` then all the found occurrences are returned as an array.
You may also set _occurrence_ to either ```load.ExtractorOccurrenceType.First``` or ```load.ExtractorOccurrenceType.Last```
to retrieve the first or the last occurrence appropriately.

* **caseInsensitive (boolean, optional)** - If set to ```false``` then the search will be using case-sensitive comparison.
If _caseInsensitive_ is not defined then the search will be using case-insensitive comparison.

* **includeRedirections (boolean, optional)** - If set to ```false``` then the search will not be performed on the headers and body of all the pages returned by redirection of the ```WebRequest```.

* **scope (string, optional)** - The scope that will be searched.
If _scope_ is not defined then only the response body will be searched.
If _scope_ is set to ```load.ExtractorScope.All``` then both the response headers and the response body are searched for _text_.
You may set _scope_ to ```load.ExtractorScope.Body``` or ```load.ExtractorScope.Headers``` to search only the response body or
 the response headers, respectively.

* **converters (string, optional)** - The converters are applied to the extracted value and convert it from one format to another. The property value is a comma separated list of converters to run sequentially on the extracted value.
Supported converters are: ```urlEncode```, ```urlDecode```, ```htmlEscape```, ```htmlUnescape```, ```base64Encode```, ```base64Decode```

* **transform** (function(value, request, response), optional) - If defined, this function will be called before the ```WebReponse``` is returned by ```send``` or ```sendSync``` on the extracted value. The arguments are _value_ - the extracted value, _request_ - the ```WebRequest``` from which the value was extracted, and _response_ - the ```WebResponse``` before the transformation.
Note that the order in which the transformations are called is the same order in which the extractors appear within ```WebRequest``` _extractors_ property. 

Example:

```javascript
 const boundaryRule1 = new load.BoundaryExtractor("title","<title>","</title>");
 const boundaryRule2 = new load.BoundaryExtractor("thirdImage",{
   leftBoundary:"<title>",
   rightBoundary:"</title>",
   occurrence:load.ExtractorOccurrenceType.Last
 });
 const boundaryRule3 = new load.BoundaryExtractor("someBase64",{
   expression:"<base64Encoded>(.*?)</base64Encoded>",
   converters:"base64Decode"
   });
 const myPageRequest = new load.WebRequest({ 
      url: "http://myServer.com/main/product.html",
      method: "GET",
      returnBody: false, //You don't need to return the body to get the extractors
      extractors:[
          boundaryRule1, //Extract the title of the page
          boundaryRule3  //Extract a value and then decode it from base64
        ]
  });

const myResponse = myPageRequest.sendSync();

//The extractor result value is available under the name of the extractor
load.log(`The title of the page is ${myResponse.extractors.title}`);

load.log(`The third image is ${myResponse.extractors.thirdImage}`);
``` 

#### RegexpExtractor(name, expression, flags) : ExtractorObject
This constructor creates an extractor object for the regular expression extractor.
It searches the headers and the body of the response for the a match of the given regular expression 
and returns the first match of the first group.

The documentation for the regular expression syntax can be found here: [https://github.com/google/re2/wiki/Syntax](https://github.com/google/re2/wiki/Syntax).
If nothing is found then ```null``` is returned.
For additional options please use the next constructor version.

#### RegexpExtractor(name, options) : ExtractorObject
Creates the same ```ExtractorObject``` as in the previous call but allows some extra options.
_options_ can include:

* **expression (string, mandatory)** - The regular expression to search with.

* **flags (string, mandatory)** - The regular expression flags (see regular expression syntax documentation for more details).

* **groupNumber (number, optional)** - The group number to return as a result (zero-based). If _groupNumber_ is not defined then the first group is returned.
You can set _groupNumber_ to 0, in this case both the full match and each search group 
in the regular expression are returned. The full match is returned as the ```full``` property 
of the result and each group is represented in the ```groups``` array in the result. 
 
* **occurrence (string/number, optional)** - The occurrence (previously Ordinal) of the result to return.
                                            If _occurrence_ is not defined then the first occurrence is returned.
                                            If _occurrence_ is set to a number, than the result with the given number index is returned.
                                            If _occurrence_ is set to ```load.ExtractorOccurrenceType.All``` then all the found occurrences are returned as an array. In this case each result is based on the _groupNumber_ parameter logic.
                                            You may also set _occurrence_ to either ```load.ExtractorOccurrenceType.First``` or ```load.ExtractorOccurrenceType.Last```
                                            to retrieve the first or the last occurrence appropriately.
 
* **includeRedirections (boolean, optional)** - If set to ```false``` then the search will not be performed on the headers and body of all the pages returned by redirection of the ```WebRequest```.

* **scope (string, optional)** - The scope that will be searched.
If _scope_ is not defined then only the response body will be searched.
If _scope_ is set to ```load.ExtractorScope.All``` then both the response headers and the response body are searched for _text_.
You may set _scope_ to ```load.ExtractorScope.Body``` or ```load.ExtractorScope.Headers``` to search only the response body or
 the response headers, respectively.
 
* **converters (string, optional)** - The converters are applied to the extracted value and convert it from one format to another. The property value is a comma separated list of converters to run sequentially on the extracted value.
Supported converters are: ```urlEncode```, ```urlDecode```, ```htmlEscape```, ```htmlUnescape```, ```base64Encode```, ```base64Decode```

* **transform** (function(value, request, response), optional) - If defined, this function will be called before the ```WebReponse``` is returned by ```send``` or ```sendSync``` on the extracted value. The arguments are _value_ - the extracted value, _request_ - the ```WebRequest``` from which the value was extracted, and _response_ - the ```WebResponse``` before the transformation.
Note that the order in which the transformations are called is the same order in which the extractors appear within ```WebRequest``` _extractors_ property. 

Example:

```javascript
 const regexpRule1 = new load.RegexpExtractor("title","<title>(.*?)</title>","i");
 const regexpRule2 = new load.RegexpExtractor("fullTitle",{
   expression: "<title>(.*?)</title>",
   flags: "i",
   groupNumber: 0
 });
 const regexpRule3 = new load.RegexpExtractor("someImage",{
   expression:"<img>(.*?)</img>",
   flags:"i",
   occurrence:2,
   includeRedirections:true
   });
 const regexpRule4 = new load.RegexpExtractor("someBase64",{
   expression:"<myBase64htmlEncoded>(.*?)</myBase64htmlEncoded>",
   converters:"base64Decode,htmlUnescape",
   transform: (value, request, response)=>{
      if (request.url === "server1"){
        return "fixed "+value;
      }
      return value
     }
   });
 const myPageRequest = new load.WebRequest({ 
      url: "http://myServer.com/main/product.html",
      method: "GET",
      returnBody: false, //You don't need to return the body to get the extractors
      extractors:[
          regexpRule1,  //Extract only the title of the page (group 0)
          regexpRule2,  //Extract the entire expression and all the groups
          regexpRule3,  //Extract the first group of the third occurrence including redirections
          regexpRule4   //Extract the value then convert it from base64 and unescape the HTML, then if the url was "server1" add a prefix to the value 
        ]
  });

const myResponse = myPageRequest.sendSync();

//The extractor result value is available under the name of the extractor.
load.log(`The title of the page is ${myResponse.extractors.title}`);

//Since we want only the title, we will take the extractor result of the first group
load.log(`The title of the page is ${myResponse.extractors.fullTitle.groups[0]}`);
//We can get the full match as well
load.log(`The full matched expression is ${myResponse.extractors.fullTitle.full}`); //This will log <title>Products</title> to the log
//We can retrieve a particular occurrence
load.log(`The third image of the page is ${myResponse.extractors.someImage}`);
``` 

#### JsonPathExtractor(name, path, returnMultipleValues) : ExtractorObject 

This constructor will create an extractor object for the JSON path extractor.
It will search the body of the response (if it is a valid JSON) and return the matching objects(s).
If nothing is found then ```null``` is returned.
If _returnMultipleValues_ is unspecified or is false, will return only the first result, otherwise will return
an array with all the results.

For more information refer to the next constructor version.

#### JsonPathExtractor(name, options) : ExtractorObject 
This constructor will create an extractor object for the JSON path extractor.
It will search the body of the response (if it is a valid JSON) and return the matching objects(s).
If nothing is found then ```null``` is returned.

_options_ can include:

* **path (string, mandatory)** - The JSON path to search with.

* **returnMultipleValues (boolean, optional)** - If unspecified or is false, will return only the first result, otherwise will return
                                                 an array with all the results.
* **converters (string, optional)** - The converters are applied to the extracted value and convert it from one format to another. The property value is a comma separated list of converters to run sequentially on the extracted value.
                                                 Supported converters are: ```urlEncode```, ```urlDecode```, ```htmlEscape```, ```htmlUnescape```, ```base64Encode```, ```base64Decode```
                                                 
* **transform** (function(value, request, response), optional) - If defined, this function will be called before the ```WebReponse``` is returned by ```send``` or ```sendSync``` on the extracted value. The arguments are _value_ - the extracted value, _request_ - the ```WebRequest``` from which the value was extracted, and _response_ - the ```WebResponse``` before the transformation.
                                                 Note that the order in which the transformations are called is the same order in which the extractors appear within ```WebRequest``` _extractors_ property. 

Currently supported syntax for JSON path:

* **$.store.book[*].author** - The authors of all books in the store.
* __$.store.*__ - All the things in store.
* **$.store.book[?(@.price<10)]** - All the books in the store with price lower than 10. Supported conditionals are  
    - ````>,<,==,!=,<=,>=```` for numeric values
    - ````==,!=,~=,=~```` for string values
    - ````==,!=```` for boolean values
    - ````==,~=```` for arrays
    
* **$.store.book[?(@.title=="Jack \"The Rabbbit\" Smith")]** - The book with the title: Jack "The Rabbit" Smith.
* **$.store.book[0,1]** or **$.store.book[:2]** - The first two books. Note that the ":" notation is exclusive to the higher value (i.e. 0:2 are items 0 and 1 but not 2).
* **$.store.book[[?(@.title=~"Jack"]** - (non-standard contains operator) Books with the word Jack in their title.
* **$.store.book[[?(@.title~="The blood in the wind"]** - (non-standard inverse contains operator) Books with titles that are contained in "The blood in the wind".

**Note: Array condition string values must be enclosed in double quotes (") and not other types of quotes, see the example above.

```javascript
 const productNameExtractor = new load.JsonPathExtractor("productName","$.products[0].name");
 const myPageRequest = new load.WebRequest({ 
      url: "http://myServer.com/main/products.json",
      method: "GET",
      returnBody: false, //You don't need to return the body to get the extractors
      extractors: productNameExtractor //Extract the name of the first product
  });

const myResponse = myPageRequest.sendSync();

//The extractor result value is available under the name of the extractor
load.log(`The name of the first product is ${myResponse.extractors.productName}`);
``` 

#### XpathExtractor(name, path, returnMultipleValues) : ExtractorObject 
This constructor will create an extractor object for the Xpath extractor.
It will search the body of the response (if it is a valid XML) and return the matching objects(s).
If nothing is found then ```null``` is returned.
If _returnMultipleValues_ is unspecified or is false, will return only the first result, otherwise will return
an array with all the results.

For more information refer to the next constructor version.

#### XpathExtractor(name, options) : ExtractorObject 
This constructor will create an extractor object for the Xpath extractor.
It will search the body of the response (if it is a valid XML) and return the matching objects(s).
If nothing is found then ```null``` is returned.

_options_ can include:

* **path (string, mandatory)** - The Xpath to search with.

* **returnMultipleValues (boolean, optional)** - If unspecified or is false, will return only the first result, otherwise will return
                                                 an array with all the results.
* **converters (string, optional)** - The converters are applied to the extracted value and convert it from one format to another. The property value is a comma separated list of converters to run sequentially on the extracted value.
                                                 Supported converters are: ```urlEncode```, ```urlDecode```, ```htmlEscape```, ```htmlUnescape```, ```base64Encode```, ```base64Decode```
                                                 
* **transform** (function(value, request, response), optional) - If defined, this function will be called before the ```WebReponse``` is returned by ```send``` or ```sendSync``` on the extracted value. The arguments are _value_ - the extracted value, _request_ - the ```WebRequest``` from which the value was extracted, and _response_ - the ```WebResponse``` before the transformation.
                                                 Note that the order in which the transformations are called is the same order in which the extractors appear within ```WebRequest``` _extractors_ property. 

```javascript
 const productNameExtractor = new load.XpathExtractor("productName","/products[0]/name");
 const productNameExtractorSingle = new load.XpathExtractor("firstProductName",{
    path: "/products[*]",
    returnMultipleValues: false
 });

 const myPageRequest = new load.WebRequest({ 
      url: "http://myServer.com/main/products.xml",
      method: "GET",
      returnBody: false, //You don't need to return the body to get the extractors
      extractors:[
          productNameExtractor, //Extract the name of the first product
          productNameExtractorSingle //Extract the name of the first product 
        ]
  });

const myResponse = myPageRequest.sendSync();

//The extractor result value is available under the name of the extractor
load.log(`The name of the first product is ${myResponse.extractors.productName}`);
``` 

#### TextCheckExtractor(name, text, scope) : ExtractorObject
This constructor will create an extractor object for the text check extractor.
It will return ```true``` if the given _text_ was found in the response based on the _scope_ argument.
If the given _text_ is not found then ```false``` is returned.

For more information refer to the next constructor version.

#### TextCheckExtractor(name, options) : ExtractorObject
This constructor will create an extractor object for the text check extractor.
It will return ```true``` if the given _text_ was found in the response based on the _scope_ argument.
If the given _text_ is not found then ```false``` is returned.

_options_ can include:

* **text (string, mandatory)** - The string to search.

* **scope (string, optional)** - The scope that will be searched.
If _scope_ is not defined then only the response body will be searched.
If _scope_ is set to ```load.ExtractorScope.All``` then both the response headers and the response body are searched for _text_.
You may set _scope_ to ```load.ExtractorScope.Body``` or ```load.ExtractorScope.Headers``` to search only the response body or
 the response headers, respectively.

 * **includeRedirections (boolean, optional)** - If set to ```false``` then the search will not be performed on the headers and body of all the pages returned by redirection of the ```WebRequest```.

* **failOn (any, optional)** - If defined, the actual result during runtime will be compared to this value and if equal an exception will be thrown stopping the script execution. 

* **converters (string, optional)** - The converters are applied to the extracted value and convert it from one format to another. The property value is a comma separated list of converters to run sequentially on the extracted value.
                                                 Supported converters are: ```urlEncode```, ```urlDecode```, ```htmlEscape```, ```htmlUnescape```, ```base64Encode```, ```base64Decode```
                                                 
* **transform** (function(value, request, response), optional) - If defined, this function will be called before the ```WebReponse``` is returned by ```send``` or ```sendSync``` on the extracted value. The arguments are _value_ - the extracted value, _request_ - the ```WebRequest``` from which the value was extracted, and _response_ - the ```WebResponse``` before the transformation.
                                                 Note that the order in which the transformations are called is the same order in which the extractors appear within ```WebRequest``` _extractors_ property. 


```javascript
 const textCheck1 = new load.TextCheckExtractor("checkBody","hello");
 const textCheck2 = new load.TextCheckExtractor("checkAll",{
   text: "world",
   scope: load.ExtractorScope.All,
   failOn: "error"
 });

 const myPageRequest = new load.WebRequest({
      url: "http://myServer.com/main/products.json",
      method: "GET",
      returnBody: false, //You don't need to return the body to get the extractors
      extractors:[
          textCheck1, //Check that response body contains "hello"
          textCheck2  //Check both the body and the headers for the word "world" but fail the iteration if the word error returns
        ]
  });

const myResponse = myPageRequest.sendSync();

//The extractor result value is available under the name of the extractor
if (myResponse.extractors.checkBody){
    load.log(`The world "hello" was found in the response body`);
}
```

#### HtmlExtractor(name, querySelector, attributeName) : ExtractorObject
This constructor will create an extractor object for the HTML extractor.
It will search the body of the response (if it is a valid HTML) and return all the objects matching the given CSS query.
If nothing is found then ```null``` is returned.

For more information refer to the next constructor version.

#### HtmlExtractor(name, options) : ExtractorObject
This constructor will create an extractor object for the HTML extractor.
It will search the body of the response (if it is a valid HTML) and return all the objects matching the given CSS query.
If nothing is found then ```null``` is returned.

_options_ can include:

* **querySelector (string, mandatory)** - The CSS query selector to search with.

* **attributeName (string, optional)** - The attribute whose value will be extracted. If not defined inner text is extracted.

* **occurrence (string/number, optional)** - The occurrence of the result to return.
                                            If _occurrence_ is not defined then the first occurrence is returned.
                                            If _occurrence_ is set to a number, than the result with the given number index is returned.
                                            If _occurrence_ is set to ```load.ExtractorOccurrenceType.All``` then all the found occurrences are returned as an array.
                                            You may also set _occurrence_ to either ```load.ExtractorOccurrenceType.First``` or ```load.ExtractorOccurrenceType.Last``` to retrieve the first or the last occurrence appropriately.
                                                 
* **converters (string, optional)** - The converters are applied to the extracted value and convert it from one format to another. The property value is a comma separated list of converters to run sequentially on the extracted value.
                                                 Supported converters are: ```urlEncode```, ```urlDecode```, ```htmlEscape```, ```htmlUnescape```, ```base64Encode```, ```base64Decode```
                                                 
* **transform** (function(value, request, response), optional) - If defined, this function will be called before the ```WebReponse``` is returned by ```send``` or ```sendSync``` on the extracted value. The arguments are _value_ - the extracted value, _request_ - the ```WebRequest``` from which the value was extracted, and _response_ - the ```WebResponse``` before the transformation.
                                                 Note that the order in which the transformations are called is the same order in which the extractors appear within ```WebRequest``` _extractors_ property. 

```javascript
 const productNameExtractor = new load.HtmlExtractor("productName","div[productId=3]","productName");
 const productNameExtractorSingle = new load.HtmlExtractor("lastProductName",{
   querySelector: "div",
   attributeName: "productName",
   occurrence:load.ExtractorOccurrenceType.Last
 });

 const myPageRequest = new load.WebRequest({
      id: 1,
      url: "http://myServer.com/main/products.html",
      method: "GET",
      returnBody: false, //You don't need to return the body to get the extractors
      extractors:[
          productNameExtractor, //Extract the name of the product with id = 3 via the productName attribute
          productNameExtractorSingle //Extract the value of the productName attribute of the last div that has productName 
        ]
  });

const myResponse = myPageRequest.sendSync();

//The extractor result value is available under the name of the extractor
load.log(`The name of the product is ${myResponse.extractors.productName}`);

const webResponse2 = new load.WebRequest({
    id: 2,
    url: "https://myHost/auth/oauth2/grant",
    method: "GET",
    extractors: new load.HtmlExtractor("SAMLRequest", {
            "querySelector": "input[type=hidden][name=SAMLRequest]",
            "attributeName": "value"
        })
}).sendSync();

``` 

#### CookieExtractor(name, cookieName, domain, path) : ExtractorObject
This constructor will create an extractor object for the cookie extractor.
It will search the cookies of the response with the name specified in cookieName
with domain and path as optional arguments, and return the first matching cookie. If nothing is found then
```null``` is returned. For additional options please use the next constructor version.

#### CookieExtractor(name, options) : ExtractorObject
Creates the same ```ExtractorObject``` as in the previous call but allows some extra options.
_options_ can include:

* **cookieName (string, mandatory)** - The cookie name.

* **domain (string, optional)** - The cookie domain.

* **path (string, optional)** - The cookie path.

* **occurrence (string/number, optional)** - The occurrence (previously Ordinal) of the result to return.
If _occurrence_ is not defined then the first occurrence is returned.
If _occurrence_ is set to a number, than the result with the given number index is returned.
If _occurrence_ is set to ```load.ExtractorOccurrenceType.All``` then all the found occurrences are returned as an array.
You may also set _occurrence_ to either ```load.ExtractorOccurrenceType.First``` or ```load.ExtractorOccurrenceType.Last```
to retrieve the first or the last occurrence appropriately.

* **includeRedirections (boolean, optional)** - If set to ```false``` then the search will not be performed on the headers and body of all the pages returned by redirection of the ```WebRequest```.

* **converters (string, optional)** - The converters are applied to the extracted value and convert it from one format to another. The property value is a comma separated list of converters to run sequentially on the extracted value.
                                                 Supported converters are: ```urlEncode```, ```urlDecode```, ```htmlEscape```, ```htmlUnescape```, ```base64Encode```, ```base64Decode```
                                                 
* **transform** (function(value, request, response), optional) - If defined, this function will be called before the ```WebReponse``` is returned by ```send``` or ```sendSync``` on the extracted value. The arguments are _value_ - the extracted value, _request_ - the ```WebRequest``` from which the value was extracted, and _response_ - the ```WebResponse``` before the transformation.
                                                 Note that the order in which the transformations are called is the same order in which the extractors appear within ```WebRequest``` _extractors_ property. 

Example:

```javascript
 const cookie1 = new load.CookieExtractor("myCookie1", "jsessionid", "go.mic.com");
 const cookie2 = new load.CookieExtractor("myCookie2",{
   cookieName:"jsessionid",
   path:"/",
   occurrence:load.ExtractorOccurrenceType.Last
 });
 
 const myPageRequest = new load.WebRequest({ 
      url: "http://myServer.com/main/product.html",
      method: "GET",
      returnBody: false, //You don't need to return the body to get the extractors
      extractors:[
          cookie1, //Extract jsessionid cookie with domain go.mic.com value
          cookie2  //Extract jsessionid cookie with path \ value
        ]
  });

const myResponse = myPageRequest.sendSync();

//The extractor result value is available under the name of the extractor
load.log(`jsessionid with domain go.mic.com ${myResponse.extractors.cookie1}`);

load.log(`jsessionid with path \ ${myResponse.extractors.cookie2}`);
``` 



### Extractor results

The results of all the extractors will be merged into a single object under the _extractors_ property on the result object. 
For example, when using extractors on a ```WebRequest``` the resulting extracted values will be stored on the _extractors_ property of the ```WebResponse``` object
created by that request. The extracted values can be retrieved from the _extractors_ property by using the extractor name. 
The name is specified as the first argument of the extractor object constructor.
For convenience, each extracted value will also be stored on the _extractors_ property of the ```load``` namesapce, accesible anywhere in the script. 
Note that if a extractor object has the same name as another extractor object, only the last extractor result will be saved and a warning will be printed to the log.
Each extractor object returns the results in a different format. Please refer to the particular extractor object
definition in the section above for the particular format. 

Example:


```javascript
 const documentTitleExtractor = new load.RegexpExtractor("title","<title>(.*?)</title>","i");
 const myPageRequest = new load.WebRequest({ 
      url: "http://myServer.com/main/product.html",
      method: "GET",
      returnBody: false, //You don't need to return the body to get the extractors
      extractors: documentTitleExtractor
  });

const myResponse = myPageRequest.sendSync();

//The extractor result value is available under the name of the extractor
load.log(`The title of the page is ${myResponse.extractors.title}`);
//The result is also stored on the load namespace
load.log(`The title of the page is ${load.extractors.title}`);
``` 


## Cookie

An object which encapsulates all the fields of a cookie.

#### constructor(options, mode) : Cookie

Creates a cookie object that can be used in a ```setCookie``` call. The mandatory _options_ argument can be either
an object with the cookie fields or a string. See definitions in the ["Set-Cookie"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) command definition.
If an object is provided it can have the following fields:

* **name** (mandatory, string) - The name of the cookie
* **value** (mandatory, string) - The value of the cookie
* **expires** (optional, string) - The maximum lifetime of the cookie as an HTTP-date timestamp.
* **maxAge** (optional, number) - Number of seconds until the cookie expires
* **domain** (mandatory, string) - The hosts to which the cookie will be sent
* **path** (optional, string)  - A URL path that must exist in the requested resource before sending the Cookie header
* **isSecure** (optional, boolean) - Indicates whether the cookies is secure or not
* **isHttpOnly** (optional, boolean) - HTTP-only cookies aren't accessible via JavaScript
* **sameSite** (optional, string, one of "strict", "lax") - Allows servers to assert that a cookie ought not to be sent along with cross-site requests 

If a string is provided it should be in the "Set-Cookie" format such as:
```qwerty=219ffwef9w0f; Domain=somecompany.co.uk; Path=/; Expires=Wed, 30 Aug 2019 00:00:00 GMT```

Example:
```javascript
const cookie1 = new load.Cookie({
                       name:"myCookie",
                       value:"foo"
                    })

const cookie2 = new load.Cookie("qwerty=219ffwef9w0f; Domain=somecompany.co.uk; Path=/; Expires=Wed, 30 Aug 2019 00:00:00 GMT");
```


## Cookies

The cookies APIs allow you to add, remove, or clear the cookies used in web requests.

#### addCookies(cookies)

Takes a ```Cookie``` object or an array of ```Cookie``` objects and adds them to the engine.
The cookies will be used when needed according to the url of the web request.

Example: 
```javascript
const cookie = new load.Cookie({
                       name:"myCookie",
                       value:"foo"
                    })
load.addCookies(cookie);
```

#### deleteCookies(cookies)
Takes a ```Cookie``` object or an array of ```Cookie``` objects and deletes them from the engine.
No error is returned if one or more of the given cookies don't exist in the engine (i.e. were not previously added by ```addCookies```).

Example: 
```javascript
const cookie = new load.Cookie({
                       name:"myCookie",
                       value:"foo"
                    })
load.addCookies(cookie);

 // later
 
load.deleteCookies(cookie);
```

#### clearCookies()
Deletes all the cookies that were added to the engine via ```addCookies()```.

Example: 
```javascript
const cookie = new load.Cookie({
                       name:"myCookie",
                       value:"foo"
                    })
load.addCookies(cookie);

 // later
 
load.clearCookies();
```


## utils

The utils objects has some useful functions that may help you with common scripting tasks.

### Methods

#### getByBoundary(source, leftBoundary, rightBoundary) : string 

Returns the substring within the _source_ string between leftBoundary and rightBoundary.
If _leftBoundary_ is undefined then the beginning of the _source_ string is used as left boundary.
If _rightBoundary_ is undefined then the end of the _source_ string is used as the right boundary.
If either boundary is not found in the _source_ string or the _source_ string is invalid then ````null```` is returned.

Example:

```javascript
load.utils.getByBoundary("<Foo>","<",">"); // returns Foo
load.utils.getByBoundary("Unbounded Foo>",undefined,">"); // returns Unbounded Foo
load.utils.getByBoundary("<Unbounded Foo","<",undefined); // returns Unbounded Foo
load.utils.getByBoundary("Some String","<",">"); //returns null
```

#### reportDataPoint(name, value)

Reports a data point with the given _name_ and _value_ to the results database.
The reported value will be in the _CustomDataPoints_ table in the results database.
The timestamp and the reporting Vuser Id will be automatically added.
Note that the _value_ must be a number.

Example:

```javascript
load.utils.reportDataPoint("My data point", 42);
```

#### base64Encode(value, options) : string

Returns the base64 encoding of _value_.
If _options_ are defined encoding will be based on options.

_options_ can include:
* **charset** (string, default: ```utf-8```) - Destination character set of encoded value, the default is ```utf-8```. For example ```iso-8859-1```, ```windows-1252```. 
* **base64URL** (boolean, default: false) - If true, modified Base64 for URL encoding will be used. 
                            In Base64 for URL encoding the '+' and '/' characters of standard Base64 are respectively replaced by '-' and '_', so that using URL encoders/decoders is no longer necessary.
                            Base64 for URL encoding is usually used for as part of URL address or filename.
* **noPadding** (boolean, default: false) - If true, padding characters '=' will be omitted. Some variants allow or require omitting the padding '=' signs to avoid them being confused with field separators.

Example:

```javascript
let value = load.utils.base64Encode("hello");
// Output: aGVsbG8=

let word = load.utils.base64Encode("schön", { charset: "iso-8859-1" });
// Output: c2No9m4=

let test = load.utils.base64Encode("<<???>>", { base64URL: true,  noPadding: true });
// Output: PDw_Pz8-Pg
```

#### base64Decode(value, options) : string | Buffer

Returns the string or Buffer represented by the base64 string _value_.
If _options_ are defined decoding will be based on options.

_options_ can include:
* **charset** (string, default: ```utf-8```) - Source character set of decoded value, the default is ```utf-8```. For example ```iso-8859-1```, ```windows-1252```. 
* **base64URL** (boolean, default: false) - If true, modified Base64 for URL decoding will be used. 
                            In Base64 for URL encoding the '+' and '/' characters of standard Base64 are respectively replaced by '-' and '_', so that using URL encoders/decoders is no longer necessary.
                            Base64 for URL encoding is usually used for as part of URL address or filename.
* **noPadding** (boolean, default: false) - If true, padding characters '=' omitted. Some variants allow or require omitting the padding '=' signs to avoid them being confused with field separators.
* **isBinaryContent** (boolean, default: false) - If true, operation response is expected to be binary and therefore will be returned in a Buffer.

Example:

```javascript
let value = load.utils.base64Decode("aGVsbG8=");
// Output: hello

let word = load.utils.base64Decode("c2No9m4=", { charset: "iso-8859-1" });
// Output: schön

let test = load.utils.base64Decode("PDw_Pz8-Pg", { base64URL: true,  noPadding: true });
// Output: <<???>>
```

#### randomString(size, options) : string

Returns a generated random string of _size_ size.
If _options_ are defined string generation will be based on options.

_options_ can include:
* **letters** (boolean, optional) - If true lowercase and uppercase letters will be used as part of generated string.
* **digits** (boolean, optional) - If true digits will be used as part of generated string.
* **specialChars** (boolean, optional) - If true specialChars [-_@#!$%&(){}] will be used as part of generated string.
* **custom** (string, optional) - If specified generated string will be based on custom character set.

Example:

```javascript
let randomPattern = load.utils.randomString(35);
load.log(`randomPattern: ${randomPattern}`);
// randomPattern: fN6EgMvq8ubHvhi5vmGQPc1K8CysXsN7vqT

let randomNumber = load.utils.randomString(20, { digits: true });
load.log(`randomNumber: ${randomNumber}`);
// randomNumber: 45658007677846724341

let customPattern = load.utils.randomString(15, { custom: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
load.log(`customPattern: ${customPattern}`);
// customPattern: JRGFQGCDRWOEBAD
```

#### uuid() : string

Returns a generated v4 uuid string, based on RFC 4122 and DCE 1.1: Authentication and Security Services.

Example:

```javascript
let uuid = load.utils.uuid();
```

#### hash(algorithm, input, outputEncoding) : string

Returns cryptographic hash computation of _input_ string according to selected _algorithm_.

Supported _algorithm_ types are: ```md5```, ```sha1```, ```sha256```, ```sha384```, ```sha512```.

Supported _outputEncoding_ types are:
* ```base64``` (default) - Standard base64 encoded string representation.
* ```base64Raw``` - Standard base64 encoding without ```=``` padding character.
* ```base64URL``` - Base64 for URL encoding string representation.
* ```base64RawURL``` - Base64 for URL encoding encoding without ```=``` padding character.
* ```hex``` - Hexadecimal string representation.

Example:

```javascript
let signing = load.utils.hash(load.HashAlgorithm.sha256, "my text");

let myHash = load.utils.hash(load.HashAlgorithm.sha256, "my text", load.HashOutputEncoding.base64RawURL);
```

#### hash(input, options) : string

Same as ```hash(algorithm, input, outputEncoding)``` except _algorithm_ and _outputEncoding_ are provided as an options object

Example:

```javascript
let signing = load.utils.hash("my text",{
  algorithm: load.HashAlgorithm.sha256
});

let myHash = load.utils.hash("my text",{
  algorithm: load.HashAlgorithm.sha256,
  outputEncoding: load.HashOutputEncoding.base64RawURL
});
```

#### hmac(algorithm, secret, input, outputEncoding) : string

Returns cryptographic keyed hash (HMAC) computation of _input_ string according to selected _algorithm_.

Supported _algorithm_ types are: ```md5```, ```sha1```, ```sha256```, ```sha384```, ```sha512```.

Supported _outputEncoding_ types are:
* ```base64``` (default) - Standard base64 encoded string representation.
* ```base64Raw``` - Standard base64 encoding without ```=``` padding character.
* ```base64URL``` - Base64 for URL encoding string representation.
* ```base64RawURL``` - Base64 for URL encoding encoding without ```=``` padding character.
* ```hex``` - Hexadecimal string representation.

Example:

```javascript
let signing = load.utils.hmac(load.HashAlgorithm.sha256, "my_big_secret", "hello world!");

let myHmac = load.utils.hmac(load.HashAlgorithm.sha256, "my_big_secret", "hello world!", load.HashOutputEncoding.base64RawURL);
```

#### hmac(input, options) : string

Same as ```hmac(algorithm, secret, input, outputEncoding)``` except _algorithm_, _secret_, and _outputEncoding_ are provided as an options object

Example:

```javascript
let signing = load.utils.hmac("hello world!",{
  algorithm: load.HashAlgorithm.sha256,
 secret: "my_big_secret"
});

let myHmac = load.utils.hmac("hello world!",{
  algorithm: load.HashAlgorithm.sha256,
  secret: "my_big_secret",
  outputEncoding: load.HashOutputEncoding.base64RawURL
});
```

#### samlEncode(value) : string

Returns a SAML encoded string of value.
SAML Message need to be deflated and base64 encoded before sending as part of WebRequest.

Example:

```javascript
let samlMessage = `<samlp:AuthnRequest xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\" ID=\"ONELOGIN_809707f0030a5d00620c9d9df97f627afe9dcc24\" Version=\"2.0\" ProviderName=\"SP test\" IssueInstant=\"2014-07-16T23:52:45Z\" Destination=\"http://idp.example.com/SSOService.php\" ProtocolBinding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST\" AssertionConsumerServiceURL=\"http://sp.example.com/demo1/index.php?acs\">
                      <saml:Issuer>http://sp.example.com/demo1/metadata.php</saml:Issuer>
                      <samlp:NameIDPolicy Format=\"urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress\" AllowCreate=\"true\"/>
                      <samlp:RequestedAuthnContext Comparison=\"exact\">
                        <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
                      </samlp:RequestedAuthnContext>
                      </samlp:AuthnRequest>`;
let samlEncode = load.utils.samlEncode(samlMessage);
load.log(`samlEncode: ${samlEncode}`);
```

#### totp(secret, timestamp): string

Returns TOTP token with default values: 6 digits based on SHA1 algorithm.

Example:

```javascript
//base32 encoded string: "12345678901234567890"; 
let secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

totpTimestamp = Date.now();
load.log(`Time now is: ${totpTimestamp}`);

let key = load.utils.totp(secret, totpTimestamp);
load.log(`TOTP Token: ${key}`);
```

#### totp(secret, timestamp, options): string

Returns TOTP token with user defined TOTP options.

Example:

```javascript
//base32 encoded string: "12345678901234567890"; 
let secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

totpTimestamp = Date.now();
load.log(`Time now is: ${totpTimestamp}`);

let key = load.utils.totp(_secret, totpTimestamp, {digits: 8, algorithm: load.HashAlgorithm.sha512});
load.log(`TOTP Token: ${key}`);
```

### Chain

This class provides a mechanism to chain calls to other _utils_ function or custom functions that have one of the signatures:
```func()```, ```func(value)```, ```func(value,options)``` 

#### constructor(function, options, . . ., function, options)

It is possible to pass as many (function, options) pairs as needed. A _function_ argument can be a name of a function
on the _utils_ object or any other function that takes a value as its first argument and returns a value. If you don't have
options to pass to a specific function omit the argument altogether.

#### run(value) : any

Runs the chain on the given _value_.

Example:

```javascript
const myChain = new load.utils.Chain("base64Encode",(value)=>{ return {encoded:value};});
const myValue = myChain.run("Hello"); //myValue = {"encoded":"SGVsbG8="}
```
 
## net

The net API provides you with some useful network related functionality.

#### lookupService(service, protocol, domain) : string
Returns an SRV record target host with respect to its priority and weight.
If several SRV records have the same priority, then the target will be selected randomly with
respect to the weight distribution. See also https://datatracker.ietf.org/doc/html/rfc2782.

Example:

```javascript
let hostname = load.net.lookupService('xmpp-service', 'tcp', 'example.com');

let request = new load.WebRequest({
    id: 1,
    url: `https://${hostname}`,
    method: `GET`
});
```

## azure


The azure API provides you useful services on azure cloud.

#### getSecret(token, secret) : string
Return azure keyvault secret value.

Example: 
```javascript
// from terminal run the following `DevWebUtils <ClientSecret>` use the output string in script. 
let clientSecret = load.unmask("<clientSecretMasked>");
let token  = load.azure.getToken("<vaultName>", "<tenantId>", "<clientId>", clientSecret);
let secretValue = load.azure.getSecret("secret", token);
load.log(`secret: ${secretValue}`);
;
```

## VTS

The VTS integration API allows you to connect to a VTS server and perform various operations on it such as 
reading and writing from columns, managing indices, and more.

####  vtsConnect(options) : VTSClient

Connects to a VTS server using the connection parameters defined in _options_. Returns a VTSClient object
or throws an exception if the connection fails. You may call _vtsConnect_ multiple times for different servers or 
with different user credentials. Note: 

Possible options are:
* **server** (mandatory, string) - The name or IP address of the VTS server host. HTTP is assumed by default, unless the URL begins with HTTPS.	
* **port** (mandatory, number) - The port number.
* **userName** (optional, string) - The user name.  
* **password** (optional, string) - A plain text password.
* **portInQueryString** (optional, bool) - If true, the port number will be added to the query string and the requests will be sent on httpPort or httpsPort respectively.
* **httpPort** (optional, int) - if _portInQueryString_ is set to true this is the port all the http requests will be sent on.
* **httpsPort** (optional, int) - if _portInQueryString_ is set to true this is the port all the https requests will be sent on.

Example:

```javascript
const vtsClient = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      });
```


## VTSClient

The _VTSClient_ is responsible for issuing commands to the VTS server. Use it to obtain other VTS related constructs
such as _VTSColumn_, _VTSRow_. The client allows you to perform general operations which affect more than
one column, row.

### Methods

#### getColumn(columnName) : VTSColumn 

Returns a reference to a column in the VTS server with the given column name. Does not verify that the column
actually exists.

Example:

```javascript
const vtsClient = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      });
const myColumn = vtsClient.getColumn("myColumn");
```

#### getRow(rowIndex) : VTSRow

Returns a reference to a row in the VTS server with the given row index. Does not verify that the row
actually exists but the index must be a non-negative number.

Example:

```javascript
const vtsClient = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      });
const myRow = vtsClient.getRow(2);
```

#### createColumn(columnName) : VTSColumn

Creates a column on the VTS server and returns a reference to the created column.

```javascript
const vtsClient = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      });
const myColumn = vtsClient.createColumn("myColumn");
```

#### popColumns(columnNames) : Object

Pops the first fields from specified columns. _columnNames_ is an array of the column names that will be popped.
If _columnNames_ is not specified then all the columns are popped. Returns an array of the values from the popped columns.

Returns an object where each property key corresponds to a column name and each property value corresponds to the database value.

```javascript
const vtsClient = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      });
const columnValues = vtsClient.popColumns(["col1","col2"]);
load.log(`The value of col1 is ${columnValues.col1}`);
```

#### rotateColumns(columnNames, placementType) : Object

Retrieves the first field from the specified columns and moves the value to the bottom.
_columnNames_ is an array of the column names that will be rotated.
If _columnNames_ is not specified then all the columns are rotated.
_placementType_ must be one of the following:

* ```load.VTSPlacementType.stacked``` - The data is sent to an available field at the bottom of the column.

* ```load.VTSPlacementType.unique``` - If the value of the first field already exists elsewhere in the column, the top field is retrieved and then discarded. Otherwise, data is sent to an available field at the bottom of the column.

Returns an object where each property key corresponds to a column name and each property value corresponds to the database value.

Example:

```javascript
const vtsClient = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      });
const columnValues = vtsClient.rotateColumns(["col1","col2"], load.VTSPlacementType.unique);
load.log(`The value of col1 is ${columnValues.col1}`);
```

#### setValues(columnNames, values, placementType) : Object

Sets the data given in _values_ into the columns given by _columnNames_.
The number of columns must be identical to the number of values provided.

_placementType_ must be one of the following:

* ```load.VTSPlacementType.sameRow``` - Send all the data to the same row.

* ```load.VTSPlacementType.stacked``` - Data is sent to available fields in each column according to VTS internal logic.

* ```load.VTSPlacementType.unique``` - Data is sent to available fields in each column only if the value does not already exist in the column it would be written to.

Example:

```javascript
const vtsClient = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      });
const columnValues = vtsClient.setValues(["col1","col2"], ["myValue1","myValue2"], load.VTSPlacementType.sameRow);
```

#### replaceExistingValue(columnNames, newValue, existingValue)

Replaces the given _newValue_ in all the columns that were specified by _columnNames_ and where the current field
value equals _existingValue_

 Example:
 
 ```javascript
 const vtsClient = load.vtsConnect({
         server: "http://my.server.com",
         port: 1234
       });
 vtsClient.replaceExistingValue(["col1","col2"], "myNewValue", "oldValue");
 ```
 
#### searchRows(columnNames, values, delimiter) : Object

Searches for a row containing specific _values_ in specific columns. If more than one row meets the condition, the data from only one random row is returned.

Examples
 ```javascript
const vtsClient = load.vtsConnect({
         server: "http://my.server.com",
         port: 1234
       });
const row = vtsClient.searchRows(["userID"], ["junior5"], ",");
load.log(`row: ${row.useHash}, ${row.userID}, ${row.userPWD}`) // e.g row: 3, junior5, 12345
 ```


## VTSColumn

The _VTSColumn_ is a reference to a column in the VTS server.
Use this object to perform operations on the underlying column.

### Properties

#### client : VTSClient

the client which contains this row

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

 myColumn.client.createColumn("newColumn"); 
``` 


### Methods

#### clear()

Clears all data in a column.

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

myColumn.clear();
```

#### size() : Number

Returns the number of fields that contain data in a column.

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

const size = myColumn.size();
load.log(`The size of someColumn is ${size}`);

```

#### createIndex()

Creates an index on a column. If a column is not indexed, the time required to execute ```addUnique()``` increases with the number of rows. If the column is indexed, the time for 'send if unique' operations is constant.
For large databases, we recommend that you index columns you want to perform 'unique' operations.
A column is locked while an index is being built on it. Any function calls that change the column are queued until the index build completes.
If the index exists, this function has no effect.

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

myColumn.createIndex();
```

#### dropIndex()

Deletes the index on a column.

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

myColumn.dropIndex();
``` 

#### addValue(value, ifUnique)

Sets the last field of a column to a value. If there is no empty field in the column, a new row is created.
If _ifUniqe_ is ```true``` then checks if the _value_ does not exist in the column. 
If the _value_ already exists in the column, the function has no effect.

Note that _value_ must be a string.

If a column is not indexed, the time required to execute a ```addValue()``` with _ifUnique_ set to ```true``` increases with the number of rows. 
If the column is indexed, the time is constant. For large databases, we recommend that you index columns you want to perform 
this operation on via ```createIndex()```.

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

myColumn.addValue("myValue",true); //Will add "myValue" only if it doesn't exist in the column already
``` 

#### clearField(rowIndex)

Clears the data in a field within the column defined by the _rowIndex_.

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

 myColumn.clearField(3); //Will clear row 3 in this column
```

#### incrementField(rowIndex, value)

Changes the value in the field within the column defined by the _rowIndex_, by the amount passed in argument _value_.
If the field value cannot be converted to an integer or if there is no data in the field, the field value after the call is 
_value_.
Note that _value_ must be a number.

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

 myColumn.incrementField(2, 10); //Will increment row 2 in the column by 10
```

#### getFieldValue(rowIndex) : string

Retrieves the data in a field  .
If there is no data in the field, the output is ```null```.

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

 const myValue = myColumn.getFieldValue(2);
```

#### setFieldValue(rowIndex, value, existingValue)

Writes the _value_ to the field within the column defined by the _rowIndex_. 
If _existingValue_ was specified, the  _existingValue_ and the field value match, the field value is overwritten.

Example:

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

 myColumn.setFieldValue(1, "new value");
 
 myColumn.setFieldValue(1, "even newer value","new value");
```

#### pop() : string

Retrieves the value from the field in the top row of the column. 
All fields below the first row move up one row. 
For example, after the call, the value that was in the second row in the column is in the first row, 
the value that was in the third row is in the second row, and so on. 
The last field in the column is cleared.

```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

const someValue = myColumn.pop();
``` 

#### rotate(placementType) : string

Retrieves the data in the first field of the column. 
The data is removed from the first field and moved to the bottom of the column as specified by the _placementType_ parameter.
If there is no data in a cell, the output is ```null```.

_placementType_ must be one of the following:

* ```load.VTSPlacementType.stacked``` - The data is sent to an available field at the bottom of the column.

* ```load.VTSPlacementType.unique``` - If the value of the first field already exists elsewhere in the column, the top field is retrieved and then discarded. Otherwise, data is sent to an available field at the bottom of the column.


```javascript
const myColumn = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getColumn("someColumn");

const someValue = myColumn.rotate(load.VTSPlacementType.stacked);
``` 

## VTSRow

The _VTSRow_ is a reference to a row in the VTS server.
Use this object to perform operations on the underlying row.

### Properties

#### client : VTSClient

the client which contains this row

Example:

```javascript
const myRow = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getRow(1);

 myRow.client.createColumn("newColumn"); 
``` 


### Methods

#### clear()

Clears the values from all fields in a row.
If a cell has a value, ```clear()``` sets the value to an empty string.
Cells with no value are not affected. Querying such cells returns ```null``` before and after the call to ```clear()```.

Example:

```javascript
const myRow = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getRow(1);

 myRow.clear();
``` 

#### getValues() : Object

Retrieves the data in a row as an object which has a property that corresponds to each column name.
If there is no data in a field, the corresponding output is ```null```.

Example:

```javascript
const myRow = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getRow(1);

 const values = myRow.getValues();
 load.log(`The value of myColumn is ${values.myColumn}`);
```
 
#### setValues(columnNames, values) 

Sets the data given in _values_ into the columns given by _columnNames_.
The number of columns must be identical to the number of values provided.

_placementType_ must be one of the following:

* ```load.VTSPlacementType.sameRow``` - Send all the data to the same row.

* ```load.VTSPlacementType.stacked``` - Data is sent to available fields in each column according to VTS internal logic.

* ```load.VTSPlacementType.unique``` - Data is sent to available fields in each column only if the value does not already exist in the column it would be written to.

Example:

```javascript
const myRow = load.vtsConnect({
        server: "http://my.server.com",
        port: 1234
      }).getRow(1);

 myRow.setValues(["col1","col2"],["value1","value2"]);
```
  
## File

An object that allows file operations on a particular file.

#### constructor(path) : File

Creates a file object that will perform operations on file at the given _path_.
The engine controls the file lifecycle therefore you don't need to open/close the file.
The _path_ can be an absolute path or a relative path to the script directory.

Example:

```javascript

const myFile = new load.File('data.xml');

```

### Methods

#### read(options): Object

Reads the file and returns the read value based on the given _options_.

Possible options are:
* **forceRead** (optional, boolean, default: false) - When set to true, will ignore the caching mechanism and read the file from disk. Use this option only if the read file can change during the script run.	
* **returnContent** (mandatory, boolean, default: true) - When true, the entire content of the file is returned (see extractors property for retrieving partial file data).
* **extractors** (optional, extractor object or an array of extractor objects) - Works the same as the WebRequest extractors. Refer to [WebRequest Extractors](#extractors) for more details.
* **isBinaryContent** (optional, boolean, default:false) - When set to true, the returned data will be binary within a Buffer object.

Returns an object that has two properties: 
* **content** - The entire content of the read file. This property is only available when _returnContent_ is set to ```true``` in the _options_. If _isBinaryContent_ is set to true then the returned value is a binary representation of the file inside a Buffer object.    
* **extractors** - The extracted results of the given extractors. Refer to [extractor results](#extractorresults) for more details.  

Example:

```javascript

const myFile = new load.File('data.xml');
const readResult = myFile.read({
  extractors:[
    new load.RegexpExtractor("title","<customerCode>(.*?)</customerCode>","i")
  ]
});

load.log(`The customer code in data.xml is ${readResult.extractors.title}`);

```

#### append(content)

Appends the _content_ to the end of the file.
If the content is a Node.js buffer, the appended content will be binary.

Example:

```javascript
  const myFile = new load.File('results.txt');
  myFile.append(`vuser ${load.config.user.userId} passed the first page`);
```

#### write(content)

Writes the _content_ to the file, overwriting the existing text in the file.
If the content is a Node.js buffer, the written content will be binary.

Example:

```javascript
  const myFile = new load.File('results.txt');
  myFile.write(`vuser ${load.config.user.userId} passed the first page`);
```

#### isExists() : boolean

Checks if the specified file exists.

Example:

```javascript
  const myFile = new load.File('results.txt');
  myFile.write(`vuser ${load.config.user.userId} passed the first page`);
  const isFileExists = myFile.isExists(); // returns true, if the file exists at the given moment.
```
