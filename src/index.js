import TAS from "exports-loader?TAS!TheAaronSheet";

TAS.config({
    logging: {
        info: process.env.NODE_ENV !== "production",
        debug: process.env.NODE_ENV !== "production"
    }
});
if (process.env.NODE_ENV !== "production") {
    TAS.debugMode();
}

import { PFConsole } from "./PFLog";
import PFConst from "./PFConst";
// importing PFSheet imports everything else
// eslint-disable-next-line no-unused-vars
import * as PFSheet from "./PFSheet";
// eslint-disable-next-line no-unused-vars
import * as HLImport from "./HLImport";
// eslint-disable-next-line no-unused-vars
import * as PFNPCParser from "./PFNPCParser";
// eslint-disable-next-line no-unused-vars
import * as PFTemplate from "./PFTemplate";

PFConsole.log("       ,## /##                    ");
PFConsole.log("      /#/ /  ##                   ");
PFConsole.log("     / / /    ##                  ");
PFConsole.log("      | ##___#/                   ");
PFConsole.log("      | ##       athfinder        ");
PFConsole.log("   #  | ##    sheet version       ");
PFConsole.log("    ### /           " + ("0000" + PFConst.version.toFixed(2)).slice(-5) + "         ");
PFConsole.log("                                  ");
