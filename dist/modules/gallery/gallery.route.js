"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gallery_controller_1 = require("./gallery.controller");
const route = (0, express_1.Router)();
route.get("/get/:ownerId", gallery_controller_1.GalleryController.getImageByOwner);
exports.default = route;
