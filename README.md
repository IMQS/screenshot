# screenshot #

This project takes screenshots of 

## How to take screenshots ##

1. Open up the command prompt as an Adminstrator.
1. Run `npm install`
1. Replace the username and password entries in `config/00_login.json` file with your own.
1. Run `npm run screenshot https://imqsrc.imqs.co.za config output_rc`
1. You should see some output on the command line and images added to the `www/screenshot/output_rc` directory.

## How to add new screenshots ##

1. Add a new JSON file with your screenshots defined in the JSON. 

## How to compare two sets of screenshots ##

1. Run `npm run screenshot https://demo.imqs.co.za config output_demo` to generate a set of demo screenshots to compare.
1. Run `npm run diff output_demo output_rc output_demo_vs_rc`
1. Open `index.html` inside `output_demo_vs_rc` directory to see the comparison between the two sets of screenshots.
