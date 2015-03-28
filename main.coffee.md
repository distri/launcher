Launcher
========

Launch a package from a json url.

    {extend} = require "util"
    QueryString = require "./lib/qs"

    global.ENV ?= {}

    extend ENV, QueryString.parse(document.location.search.substr(1))

    $.getJSON(ENV.PACKAGE_URL)
    .then require
