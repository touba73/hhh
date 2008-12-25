/* Box.js

	Purpose:
		
	Description:
		
	History:
		Wed Nov  5 12:10:53     2008, Created by tomyeh

Copyright (C) 2008 Potix Corporation. All Rights Reserved.

	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
*/
zul.box.Box = zk.$extends(zul.Widget, {
	_mold: 'vertical',
	_align: 'start',
	_pack: 'start',

	/** Returns if it is a vertical box. */
	isVertical: function () {
		return 'vertical' == this._mold;
	},
	/** Returns the orient. */
	getOrient: function () {
		return this._mold;
	},

	/** Returns the align of this button.
	 */
	getAlign: function () {
		return this._align;
	},
	/** Sets the align of this button.
	 */
	setAlign: function(align) {
		if (this._align != align) {
			this._align = align;
			//TODO
		}
	},
	/** Returns the pack of this button.
	 */
	getPack: function () {
		return this._pack;
	},
	/** Sets the pack of this button.
	 */
	setPack: function(pack) {
		if (this._pack != pack) {
			this._pack = pack;
			//TODO
		}
	},

	//super//
	getZclass: function () {
		var zcs = this._zclass;
		return zcs != null ? zcs: this.isVertical() ? "z-vbox" : "z-hbox";
	},

	onChildVisible_: function (child, visible) {
		this.$super('onChildVisible_', child, visible);
		if (this.desktop) this._fixChildDomVisible(child, visible);
	},
	replaceChildHTML_: function (child, n, desktop) {
		this.$super('replaceChildHTML_', child, n, desktop);
		this._fixChildDomVisible(child, child._visible);
	},
	_fixChildDomVisible: function (child, visible) {
		var n = zDom.$(child.uuid + '$chdex');
		if (n) n.style.display = visible ? '': 'none';
		n = zDom.$(child.uuid + '$chdex2');
		if (n) n.style.display = visible ? '': 'none';

		if (this.lastChild == child) {
			n = child.previousSibling;
			if (n) {
				n = zDom.$(n + '$chdex2')
				if (n) n.style.display = visible ? '': 'none';
			}
		}
	},

	insertChildHTML_: function (child, before, desktop) {
		if (before) {
			zDom.insertHTMLBefore(zDom.$(before.uuid + "$chdex"), this.encloseChildHTML_(child));
		} else {
			var n = this.getNode();
			if (this.isVertical())
				n = n.tBodies[0];
			else
				n = n.tBodies[0].rows[0];
			zDom.insertHTMLBeforeEnd(n, this.encloseChildHTML_(child, true));
		}
		child.bind_(desktop);
	},
	removeChildHTML_: function (child, prevsib) {
		this.$super('removeChildHTML_', child, prevsib);
		zDom.remove(child.uuid + '$chdex');
		zDom.remove(child.uuid + '$chdex2');
		if (prevsib && this.lastChild == prevsib) //child is last
			zDom.remove(prevsib.uuid + '$chdex2');
	},
	encloseChildHTML_: function (child, last) {
		var out = [];//, childhtml = child.redraw();
		if (this.isVertical()) {
			out.push('<tr id="', child.uuid, '$chdex"',
				this._childOuterAttrs(child),
				'><td', this._childInnerAttrs(child),
				'>', childhtml, '</td></tr>');

			if (child.nextSibling)
				out.push(this._spacingHTML(child));
			else if (last) {
				var pre = child.previousSibling;
				if (pre) out.unshift(this._spacingHTML(pre));
			}
		} else {
			out.push('<td id="', child.uuid, '$chdex"',
				this._childOuterAttrs(child),
				this._childInnerAttrs(child),
				'>', childhtml, '</td>');

			if (child.nextSibling)
				out.push(this._spacingHTML(child));
			else if (last) {
				var pre = child.previousSibling;
				if (pre) out.unshift(this._spacingHTML(pre));
			}
		}
		return out.join('');
	},
	_spacingHTML: function (child) {
		var out = [],
			spacing = this.spacing,
			spacing0 = spacing && spacing.startsWith('0')
				&& (spacing.length == 1 || zk.isDigit(spacing.charAt(1))),
			vert = this.isVertical(),
			spstyle = spacing ? (vert?'height:':'width:') + spacing: '';

		out.push('<t', vert?'r':'d', ' id="', child.uuid,
			'$chdex2" class="', this.getZclass(), '-sep"');

		var s = spstyle;
		if (spacing0 || !child.isVisible()) s = 'display:none' + s;
		if (s) out.push(' style="', s, '"');

		out.push('>', vert?'<td>':'', zUtl.img0, vert?'</td></tr>':'</td>');
		return out.join('');
	},
	_childOuterAttrs: function (child) {
		var html = '';
		if (child.$instanceof(zul.box.Splitter))
			html = ' class="' + child.getZclass() + '-outer"';
		else if (this.isVertical()) {
			var v = this.getPack();
			if (v) html = ' valign="' + zul.box.Box._toValign(v) + '"';
		} else
			return ''; //if hoz and not splitter, display handled in _childInnerAttrs

		if (!child.isVisible()) html += ' style="display:none"';
		return html;
	},
	_childInnerAttrs: function (child) {
		var html = '',
			vert = this.isVertical(),
			$Splitter = zul.box.Splitter;
		if (child.$instanceof($Splitter))
			return vert ? ' class="' + child.getZclass() + '-outer-td"': '';
				//spliter's display handled in _childOuterAttrs

		var v = vert ? this.getAlign(): this.getPack();
		if (v) html += ' align="' + zul.box.Box._toHalign(v) + '"'

		var style = '', szes = this._sizes;
		if (szes) {
			for (var j = 0, len = szes.length, c = this.firstChild;
			c && j < len; c = c.nextSibling) {
				if (child == c) {
					style = (vert ? 'height:':'width:') + szes[j];
					break;
				}
				if (!c.$instanceof($Splitter))
					++j;
			}
		}

		if (!vert && !child.isVisible()) style += ';display:none';
		return style ? html + ' style="' + style + '"': html;
	},

	bind_: function (desktop) {
		this.$super('bind_', desktop);

		zWatch.listen("onSize", this);
		zWatch.listen("onVisible", this);
		zWatch.listen("onHide", this);
	},
	unbind_: function () {
		zWatch.unlisten("onSize", this);
		zWatch.unlisten("onVisible", this);
		zWatch.unlisten("onHide", this);

		this.$super('unbind_');
	},
	onSize: _zkf = function () {
		if (!this.isRealVisible()) return;

		var $Splitter = zul.box.Splitter;
		for (var c = this.firstChild;; c = c.nextSibling) {
			if (!c) return; //no splitter
			if (c.$instanceof($Splitter)) //whether the splitter has been dragged
				break;
		}

		var vert = this.isVertical(), node = this.getNode();

		//Bug 1916473: with IE, we have make the whole table to fit the table
		//since IE won't fit it even if height 100% is specified
		if (zk.ie) {
			var p = node.parentNode;
			if (zDom.tag(p) == "TD") {
				var nm = vert ? "height": "width",
					sz = vert ? p.clientHeight: p.clientWidth;
				if ((node.style[nm] == "100%" || this._box100) && sz) {
					node.style[nm] = sz + "px";
					this._box100 = true;
				}
			}
		}

		//Note: we have to assign width/height fisrt
		//Otherwise, the first time dragging the splitter won't be moved
		//as expected (since style.width/height might be "")

		var nd = vert ? node.rows: node.rows[0].cells,
			total = vert ? zDom.revisedHeight(node, node.offsetHeight):
				zDom.revisedWidth(node, node.offsetWidth);

		for (var i = nd.length; --i >= 0;) {
			var d = nd[i];
			if (zDom.isVisible(d))
				if (vert) {
					var diff = d.offsetHeight;
					if(d.id && !d.id.endsWith("$chdex2")) { //TR
						//Bug 1917905: we have to manipulate height of TD in Safari
						if (d.cells.length) {
							var c = d.cells[0];
							c.style.height = zDom.revisedHeight(c, i ? diff: total) + "px";
						}
						d.style.height = ""; //just-in-case
					}
					total -= diff;
				} else {
					var diff = d.offsetWidth;
					if(d.id && !d.id.endsWith("$chdex2")) //TD
						d.style.width = zDom.revisedWidth(d, i ? diff: total) + "px";
					total -= diff;
				}
		}
	},
	onVisible: _zkf,
	onHide: _zkf
},{
	_toValign: function (v) {
		return v ? "start" == v ? "top": "center" == v ? "middle":
			"end" == v ? "bottom": v: null;
	},
	_toHalign: function (v) {
		return v ? "start" == v ? "left": "end" == v ? "right": v: null;
	}
});
