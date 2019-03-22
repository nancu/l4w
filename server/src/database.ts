//@ts-ignore TS1192
import sequelize from "sequelize"

import { HttpStatus, ResourceType } from "../../common/src/Constants"
import { models } from "./models/index"
import * as utils from "./utils"
import { constants } from "./constants"
import { defaults } from "./defaults"
import { IDialogNodeData, IDialogEdgeData } from "../../common/src/model/Dialog";

export namespace database2 {

    //TODO this is nonsense, please cleanse it
    function getDefaults(type: string, file: string | undefined) {
        if (!utils.isEmpty(file)) {
            return file!;
        }
        if (ResourceType.MAP === type) {
            // TODO ora c'è un record di default, dovrei fare l'upsert sul solo
            // record interessato
            return "%MAPS%";
        }
        return "TODO";
    }
    
    function logAccess(user: string) {
        // User already known, log this access
        models.log_access.update({
            last_seen : new Date(),
            access_counter : sequelize.literal("access_counter + 1")
        }, {
            where : {
                user : user,
            }
        }).then(function(r: any) {
        }, function(error: any) {
            console.log(error);
        });
    };
    
    function manageQueryError(response: any, error: any) {
        console.error(error);
        response.status(HttpStatus.BAD_REQUEST).send("");
    };

    export function init() {
        return new Promise(function(resolve, reject) {
            // Test authentication
            models.sequelize.authenticate().then(function() {
                resolve();
            }, function(err: any) {
                console.error("Authentication on PostgreSQL failed: " + err);
                reject();
            });
        });
    }

    export function read(type: ResourceType, file: string | undefined, user: string, response: any) {
        file = getDefaults(type, file);
        switch (type) {
        case ResourceType.MAP:
            models.l4w_map.findOne({
                where : {
                    id : file
                },
                attributes : [ "data" ]
            }).then(
                    function(result: any) {
                        if (!utils.isEmpty(result)) {
                            response.json(result.data);
                        } else {
                            console.log("Map "+ file + " not found, returning default");
                            response.send(
                                    defaults.getDefaultMap());
                        }
                    },
                    function(error: any) {
                        console.log(error);
                        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
                                defaults.getDefaultMap());
                    });
            break;
        case ResourceType.TILESET:
            models.l4w_tileset.findOne({
                where : {
                    image : file
                },
                attributes : [ "data" ]
            }).then(
                    function(result: any) {
                        if (!utils.isEmpty(result)) {
                            response.json(result.data);
                        } else {
                            console.log("Tileset "+ file + " not found, returning default");
                            response.send(defaults.getDefaultMap());
                        }
                    },
                    function(error: any) {
                        console.log(error);
                        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
                                defaults.getDefaultTileset());
                    });
            break;
        case ResourceType.SAVE:
            if (!utils.isEmpty(user)) {
                models.usr_save.findOne({
                    where : {
                        user : user,
                        id : file
                    },
                    attributes : [ "save" ]
                }).then(
                    function(result: any) {
                        if (!utils.isEmpty(result)) {
                            response.send(result.dataValues.save);
                        } else {
                            response.send(defaults.getDefaultSave());
                        }
                    },
                    function(error: any) {
                        console.log(error);
                        response.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .send(defaults.getDefaultSave());
                    });
            } else {
                response.status(HttpStatus.OK).send(defaults.getDefaultSave());
            }
            break;
        case ResourceType.STRING:
            models.l4w_string.findOne({
                where : {
                    id : file
                },
                attributes : [ "lang", "value" ]
            }).then(
                function(result: any) {
                    if (!utils.isEmpty(result)) {
                        response.send(result.dataValues.value);
                    } else {
                        response.status(HttpStatus.NOT_FOUND)
                            .send(defaults.getDefaultString());
                    }
                },
                function(error: any) {
                    console.log(error);
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .send(defaults.getDefaultSave());
                }
            );
            break;
        case "dialog":
            //TODO next
            //Query custom ricorsiva sui dati, avevo la bozza su txt.txt?
        default:
            console.error("Unexpected case: " + type);
            response.status(HttpStatus.NOT_FOUND).send(defaults.getDefaultString());
        };
    }

    export function write(type: string, file: string | undefined, data: string, user: string, response: any) {
        file = getDefaults(type, file);

        switch (type) {
        case ResourceType.MAP:
            models.l4w_map.upsert({
                id : file,
                data : JSON.parse(data)
            }).then(function(result: any) {
                response.status(HttpStatus.OK).send("");
            }, function(error: any) {
                manageQueryError(response, error);
            });
            break;
        case ResourceType.TILESET:
            models.l4w_tileset.upsert({
                image : file,
                data : JSON.parse(data)
            }).then(function(result: any) {
                response.status(HttpStatus.OK).send("");
            }, function(error: any) {
                manageQueryError(response, error);
            });
            break;
        case ResourceType.SAVE:
            models.usr_save.upsert({
                user: user,
                id : file,
                date: new Date(),
                name: null,
                save : JSON.parse(data)
            }).then(function(result: any) {
                response.status(HttpStatus.OK).send("");
            }, function(error: any) {
                manageQueryError(response, error);
            });
            break;
        case ResourceType.STRING:
            let strings = JSON.parse(data);
            let counter = strings.length;
            let callbackSuccess = function() {
                counter--;
                if(counter <= 0) {
                    response.status(HttpStatus.OK).send("");
                }
            }
            let id = undefined;
            if(!utils.isEmpty(file)) {
                id = file;
            }
            for(let lang in strings) {
                models.l4w_string.upsert({
                    id : id,
                    lang: lang,
                    save : strings[lang]
                }).then(callbackSuccess, function(error: any) {
                    counter = 999;
                    manageQueryError(response, error);
                });
            }
            break;
        case "dialog":
            //Scomponi il dialog in nodes e edges, e salvali a DB
            let dialogNode: IDialogNodeData = JSON.parse(data);
            let nodesList: IDialogNodeData[];
            let edgesList: IDialogEdgeData[];

            //TODO next
         
        default:
            console.error("Unexpected case: " + type);
            response.status(HttpStatus.NOT_FOUND).send(defaults.getDefaultString());
        }
    }

    export function logUserSessionAccess(user: string) {
        logAccess(user)
    }

    export function logUser(mail: string, request: any, response: any) {
        models.usr_list.findOne({
            where: {
                mail: mail
            }
        }).then(function(user_record: any) {
            if(user_record == null) {
                // First access, create the user
                models.usr_list.upsert({
                    mail: mail,
                }).then(function(updated: any) {
                    // Get the new user record
                    models.usr_list.findOne({
                        where: {
                            mail: mail
                        }
                    }).then(function(user_new_record: any) {
                        if(user_record == null) {                        
                            // Add user id to session
                            request.session.user = user_new_record.user;
                            request.session.save();
                            
                            // Send welcome event to the new user
                            models.usr_event.upsert({
                                user: user_new_record.user,
                                event: constants.event.WELCOME,
                                date: new Date()
                            }).then(function(res: any) {
                            }, function(error: any) {
                                console.log(error);
                            });
                            
                            // Log first access for the new user user
                            models.log_access.upsert({
                                user: user_new_record.user,
                                first_seen: new Date(),
                                last_seen: new Date(),
                                access_counter: 1
                            }).then(function(res: any) {
                            }, function(error: any) {
                                console.log(error);
                            });
                        } else {
                            console.error("Registration failed for: " + mail);
                        }
                    }, function(error: any) {
                        console.log(error);
                        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send("");
                    });
                }, function(error: any) {
                    console.log(error);
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send("");
                });
            } else {
                // Add user id to session
                request.session.user = user_record.user;
                request.session.save();
                
                // Log this access
                logAccess(user_record.user);
            }
        }, function(error: any) {
            console.log(error);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send("");
        });
    }

    export function getNews(user: string, response: any) {
        if (utils.isEmpty(user)) {
            response.json({});
        } else {
            models.usr_event.findAll({
                where : {
                    user : user
                },
                attributes : [ "event" ],
            }).then(function(events: any) {
                if (!utils.isEmpty(events)) {
                    var eventsArray = new Array;
                    for (var i = 0; i < events.length; i++) {
                        eventsArray.push(events[i].event);
                    }
                    models.lst_event.findAll({
                        where : {
                            event : eventsArray
                        }
                    }).then(function(datas: any) {
                        response.json(datas);
                    });
                } else {
                    response.json({});
                }
            })
        }
    }
}
