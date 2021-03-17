/* B96_ZK_4636Test.java

	Purpose:
		
	Description:
		
	History:
		Tue Mar 16 15:49:39 CST 2021, Created by katherinelin

Copyright (C) 2021 Potix Corporation. All Rights Reserved.
*/
package org.zkoss.zktest.zats.test2;

import org.junit.Assert;
import org.junit.Test;
import org.zkoss.zktest.zats.WebDriverTestCase;
import org.zkoss.zktest.zats.ztl.JQuery;

public class B96_ZK_4636Test extends WebDriverTestCase {
	@Test
	public void test() {
		connect();
		JQuery btn = jq(".z-slider-button");
		int sliderWidth = jq("@slider").width();
		getActions().clickAndHold(toElement(btn)).moveByOffset(sliderWidth + 10, 0).perform();
		waitResponse();
		Assert.assertFalse(isZKLogAvailable());
	}
}
