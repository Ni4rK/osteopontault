"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpPath;
(function (HttpPath) {
    HttpPath["AUTH_TOKEN"] = "/authentication/token";
    HttpPath["AVAILABILITY_GET"] = "/availability_slot";
    HttpPath["AVAILABILITY_INSERT"] = "/availability_slot";
    HttpPath["AVAILABILITY_UPDATE"] = "/availability_slot";
    HttpPath["AVAILABILITY_BOOK"] = "/availability_slot/book";
    HttpPath["AVAILABILITY_DELETE"] = "/availability_slot";
    HttpPath["MEMBER_PWA_SUBSCRIPTION"] = "/member/pwa_subscription";
    HttpPath["SCRIPT_DATABASE_MIGRATION"] = "/script/database_migration";
    // dev
    HttpPath["SCRIPT_INIT_DATABASE"] = "/script/init_database";
    HttpPath["SCRIPT_CREATE_USER"] = "/script/create_user";
})(HttpPath || (HttpPath = {}));
exports.default = HttpPath;
