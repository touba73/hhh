/* Z35_tabbox_206Test.java

		Purpose:
		
		Description:
		
		History:
				Wed Jun 19 17:30:34 CST 2019, Created by leon

Copyright (C) 2019 Potix Corporation. All Rights Reserved.
*/
package org.zkoss.zktest.zats.test2;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import org.zkoss.test.webdriver.WebDriverTestCase;

public class Z35_tabbox_206Test extends WebDriverTestCase {
	@Test
	public void test() {
		connect();
		int tabboxleftWidth = jq(".z-tabbox-left").width();
		click(jq("@tab:contains(Tab 2)"));
		waitResponse();
		click(jq("@tab:contains(Tab 1)"));
		waitResponse();
		Assertions.assertEquals(tabboxleftWidth, jq(".z-tabbox-left").width());
	}
}
