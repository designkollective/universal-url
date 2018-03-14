"use strict";
const {afterEach, beforeEach, describe, it} = require("mocha");
const {expect} = require("chai");
const Nightmare = require("nightmare");

let browser;



const getBrowser = () => new Nightmare({ nodeIntegration:false }).goto("about:blank");



const it_browser_URL = ({checkHost, useGlobal}) =>
{
	it(`works${useGlobal ? " globally" : ""}`, function()
	{
		return browser.evaluate( function(useGlobal)
		{
			var URL;

			if (useGlobal)
			{
				UniversalURL.shim();
				URL = window.URL;
			}
			else
			{
				URL = UniversalURL.URL;
			}

			var url = new URL("http://faß.ExAmPlE/?param=value");

			// Cannot return a native instance
			return {
				hostname: url.hostname,
				search: url.search,
				param: url.searchParams.get("param")
			};
		}, useGlobal)
		.then(result =>
		{
			if (checkHost)
			{
				expect(result.hostname).to.equal("xn--fa-hia.example");
			}

			expect(result.search).to.equal("?param=value");
			expect(result.param).to.equal("value");
		});
	});
};



const it_browser_URLSearchParams = ({useGlobal}) =>
{
	it(`works${useGlobal ? " globally" : ""}`, function()
	{
		return browser.evaluate( function(useGlobal)
		{
			var URLSearchParams;

			if (useGlobal)
			{
				UniversalURL.shim();
				URLSearchParams = window.URLSearchParams;
			}
			else
			{
				URLSearchParams = UniversalURL.URLSearchParams
			}

			var params = new URLSearchParams("?p1=v&p2=&p2=v&p2");

			// Cannot return a native instance
			return {
				params: params,
				p1: params.get("p1"),
				p2: params.get("p2"),
				p2all: params.getAll("p2")
			};
		}, useGlobal)
		.then(result =>
		{
			expect(result.params).to.not.be.undefined;
			expect(result.p1).to.equal("v");
			expect(result.p2).to.equal("");
			expect(result.p2all).to.deep.equal(["", "v", ""]);
		});
	});;
};



const it_node_URL = ({lib, useGlobal}) =>
{
	it(`works${useGlobal ? " globally" : ""}`, function()
	{
		let URL;

		if (useGlobal)
		{
			lib.shim();
			URL = global.URL;
		}
		else
		{
			URL = lib.URL;
		}

		const url = new URL("http://faß.ExAmPlE/?param=value#hash");

		expect( url.hostname ).to.equal("xn--fa-hia.example");
		expect( url.search ).to.equal("?param=value");
		expect( url.searchParams ).to.not.be.undefined;
		expect( url.searchParams.get("param") ).to.equal("value");
	});
};



const it_node_URLSearchParams = ({lib, useGlobal}) =>
{
	it(`works${useGlobal ? " globally" : ""}`, function()
	{
		let URLSearchParams;

		if (useGlobal)
		{
			lib.shim();
			URLSearchParams = global.URLSearchParams;
		}
		else
		{
			URLSearchParams = lib.URLSearchParams;
		}

		const params = new URLSearchParams("?p1=v&p2=&p2=v&p2");

		expect( params ).to.not.be.undefined;
		expect( params.get("p1") ).to.equal("v");
		expect( params.get("p2") ).to.equal("");
		expect( params.getAll("p2") ).to.deep.equal(["", "v", ""]);
	});
};



describe("Node.js", function()
{
	const lib = require("./");



	afterEach( function()
	{
		global.URL = null;
		global.URLSearchParams = null;
	});



	describe("URL", function()
	{
		it_node_URL({ lib, useGlobal:false });
		it_node_URL({ lib, useGlobal:true });
	});



	describe("URLSearchParams", function()
	{
		it_node_URLSearchParams({ lib, useGlobal:false });
		it_node_URLSearchParams({ lib, useGlobal:true });
	});
});



describe("Web Browser (without native)", function()
{
	before(() => browser = getBrowser());



	beforeEach(() => browser.refresh().evaluate( function()
	{
		window.URL = undefined;
		window.URLSearchParams = undefined;
	})
	.then(() => browser.inject("js", "browser-built.js")));



	after(() => browser.end());



	describe("URL", function()
	{
		it_browser_URL({ checkHost:true, useGlobal:false });
		it_browser_URL({ checkHost:true, useGlobal:true });
	});



	describe("URLSearchParams", function()
	{
		it_browser_URLSearchParams({ useGlobal:false });
		it_browser_URLSearchParams({ useGlobal:true });
	});
});



describe("Web Browser (with native)", function()
{
	before(() => browser = getBrowser());

	beforeEach(() => browser.refresh().inject("js", "browser-built.js"));

	after(() => browser.end());



	describe("URL", function()
	{
		// TODO :: `checkHost:true` when Chrome correctly converts from Unicode to ASCII
		it_browser_URL({ checkHost:false, useGlobal:false });
		it_browser_URL({ checkHost:false, useGlobal:true });
	});



	describe("URLSearchParams", function()
	{
		it_browser_URLSearchParams({ useGlobal:false });
		it_browser_URLSearchParams({ useGlobal:true });
	});
});
