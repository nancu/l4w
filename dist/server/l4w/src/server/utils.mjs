import fs from "fs";
import { HttpStatus } from "../common/Constants";
const placeholder = "404.png";
export function sendFile(path, filename, response) {
    let options = {
        dotfiles: "deny",
        headers: {
            "x-timestamp": Date.now(),
            "x-sent": true
        }
    };
    let extension = filename.split(".").pop();
    switch (extension) {
        case "json":
            response.type("application/json");
            break;
        case "properties":
            response.type("text/x-java-properties");
            break;
        case "js":
            response.type("application/javascript");
            break;
        case "css":
            response.type("text/css");
            break;
        case "woff2":
            response.type("font/woff2");
            break;
    }
    response.sendFile(path + "/" + filename, options, function (err) {
        if (err && response.statusCode !== HttpStatus.NOT_MODIFIED && err.code !== "ECONNABORT") {
            if (response.statusCode === HttpStatus.NOT_FOUND && filename !== placeholder) {
                sendFile(path, placeholder, response);
            }
            else {
                if (err.message !== "Request aborted") {
                    console.warn("utils.sendFile (file: " + path + "/" + filename + ") " + err);
                }
                try {
                    if (err.status !== undefined) {
                        response.status(err.status).send("");
                    }
                    else {
                        response.status(HttpStatus.NO_CONTENT).send("");
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    });
}
;
export function endsWith(file, suffix) {
    return file.indexOf(suffix, file.length - suffix.length) !== -1;
}
export function isEmpty(obj) {
    if (obj === null || typeof obj === "undefined") {
        return true;
    }
    else if (typeof obj === "string") {
        return obj === "";
    }
    else if (typeof obj === "object" && "size" in obj) {
        return obj.size === 0;
    }
    else if (obj.constructor === Array || obj.constructor === String) {
        return obj.length === 0;
    }
    return false;
}
export function listFiles(filePath, response) {
    return new Promise(resolve => {
        fs.readdir(filePath, (err, files) => {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let is404 = file.startsWith("404");
                let isHidden = file.startsWith(".");
                let isDirectory = fs.lstatSync(filePath + "/" + file).isDirectory();
                if (is404 || isHidden || isDirectory) {
                    files.splice(i, 1);
                    i--;
                }
            }
            if (!isEmpty(err)) {
                console.error(err);
            }
            if (response !== undefined) {
                response.json(files);
            }
            resolve(files);
        });
    });
}
export function pruneObject(obj) {
    let out = {};
    for (let field in obj) {
        let val = obj[field];
        while (Array.isArray(val) && val.length > 0) {
            val = val[0];
        }
        if (typeof val === "string" || typeof val === "boolean" || typeof val === "number") {
            out[field] = obj[field];
        }
    }
    return out;
}
export function cleanDialogNode(node) {
    delete node.message;
    delete node.edges;
    delete node.referenced;
}
export function cleanDialogEdge(edge) {
    delete edge.message;
    delete edge.node;
    delete edge.nodeReferenced;
    delete edge.actions;
}
