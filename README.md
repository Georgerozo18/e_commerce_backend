# How to generate random JWT secret key

To generate a random JWT secret key, you can use a tool like Node
js to create a random string. Here's a simple example:

1. Open your terminal or command prompt.
2. Run the following Node.js script to generate a random string:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This command uses the **crypto** module in Node.js to generate a
random sequence of 32 bytes and then converts it to a hexadecimal
string.

1. Copy the generated string.
2. Open your **.env** file and set the JWT secret key:

```
JWT_SECRET=paste-the-generated-string-here
```