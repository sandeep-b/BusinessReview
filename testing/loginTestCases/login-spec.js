describe('Testcases for the login feature',function(){
   browser.get('http://localhost:1337');

	it("Basic ui check",function(){
       expect(element(by.css("body > div > div > div > div > div:nth-child(1) > img")).isPresent()).toBe(true);
       expect(element(by.css("body > div > div > div > div > div.panel.panel-primary > div.panel-heading")).isPresent()).toBe(true);
       expect(element(by.css("body > div > div > div > div > div.panel.panel-primary > div.panel-heading")).getText()).toEqual("Login into Glocal");
       expect(element(by.css("body > div > div > div > div > div.panel.panel-primary > div.panel-body > div")).getText()).toEqual("New to Glocal? Sign Up");
       expect(element(by.css("body > div > div > div > div > div.panel.panel-primary > div.panel-body > form > div:nth-child(1) > label")).getText()).toEqual("Email");
       expect(element(by.model("user.email")).isPresent()).toBe(true);
       expect(element(by.css("body > div > div > div > div > div.panel.panel-primary > div.panel-body > form > div:nth-child(2) > label")).getText()).toEqual("Password");
       expect(element(by.css("body > div > div > div > div > div.panel.panel-primary > div.panel-body > form > div:nth-child(3) > a")).isPresent()).toBe(true);
       expect(element(by.css("body > div > div > div > div > div.panel.panel-primary > div.panel-body > form > div:nth-child(3) > a")).getText()).toEqual("Forgot Password?");
       expect(element(by.css("body > div > div > div > div > div.panel.panel-primary > div.panel-body > form > div.form-actions > button")).isPresent()).toBe(true);


	});
});