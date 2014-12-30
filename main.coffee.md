Launcher
========

Launch a package from a json url.

    {extend} = require "util"
    Runner = require "runner"
    QueryString = require "./lib/qs"

    global.ENV ?= {}

    extend global.ENV, QueryString.parse(document.location.search.substr(1))

    alert ENV.PACKAGE_URL

    $.getJSON(ENV.PACKAGE_URL)
    .then require
