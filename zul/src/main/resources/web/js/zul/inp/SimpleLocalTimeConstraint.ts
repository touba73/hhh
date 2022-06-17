/* SimpleLocalTimeConstraint.ts

	Purpose:

	Description:

	History:
		Wed Aug 14 15:01:24 CST 2019, Created by rudyhuang

Copyright (C) 2019 Potix Corporation. All Rights Reserved.

This program is distributed under LGPL Version 2.1 in the hope that
it will be useful, but WITHOUT ANY WARRANTY.
*/
/**
 * A simple time constraint.
 * @disable(zkgwt)
 * @since 9.0.0
 */
export class SimpleLocalTimeConstraint extends zul.inp.SimpleConstraint {
	public readonly format = 'HHmmss';
	private _wgt: zul.db.Datebox;
	private _localizedSymbols?: zk.LocalizedSymbols;
	private _beg?: DateImpl;
	private _end?: DateImpl;
	
	/** Constructor.
	 * @param Object a
	 * It can be String or number, the number or name of flag,
	 * such as "no positive", 0x0001.
	 * @param zk.Widget the datebox
	 */
	public constructor(a: unknown, wgt: zul.db.Datebox) {
		super(a);
		this._wgt = wgt;
		this._localizedSymbols = wgt._localizedSymbols;
	}

	protected override parseConstraint_(constraint: string): void {
		var len = this.format.length + 1,
			arr = this._cstArr,
			wgt = this._wgt,
			tz = wgt && wgt.getTimeZone && wgt.getTimeZone();
		if (constraint.startsWith('between')) {
			var j = constraint.indexOf('and', 7);
			if (j < 0 && zk.debugJS)
				zk.error('Unknown constraint: ' + constraint);
			this._beg = new zk.fmt.Calendar(null, this._localizedSymbols).parseDate(constraint.substring(7, j), this.format, null, null, null, tz);
			this._end = new zk.fmt.Calendar(null, this._localizedSymbols).parseDate(constraint.substring(j + 3, j + 3 + len), this.format, null, null, null, tz);
			if (this._beg!.getTime() > this._end!.getTime()) {
				var d = this._beg;
				this._beg = this._end;
				this._end = d;
			}
			arr[arr.length] = 'between';
		} else if (constraint.startsWith('before') && !constraint.startsWith('before_')) {
			this._end = new zk.fmt.Calendar(null, this._localizedSymbols).parseDate(constraint.substring(6, 6 + len), this.format, null, null, null, tz);
			arr[arr.length] = 'before';
		} else if (constraint.startsWith('after') && !constraint.startsWith('after_')) {
			this._beg = new zk.fmt.Calendar(null, this._localizedSymbols).parseDate(constraint.substring(5, 5 + len), this.format, null, null, null, tz);
			arr[arr.length] = 'after';
		}
		return super.parseConstraint_(constraint);
	}

	public override validate(wgt: zk.Widget, val: unknown): zul.inp.SimpleConstraintErrorMessages | string | undefined {
		var result = super.validate(wgt, val);
		if (val instanceof DateImpl) {
			var msg = this._errmsg,
				time = this._getTime(val);
			if (this._beg != null && this._getTime(this._beg) > time)
				return msg['between'] || msg['after'] || this.outOfRangeValue();
			if (this._end != null && this._getTime(this._end) < time)
				return msg['between'] || msg['before'] || this.outOfRangeValue();
		}
		return result;
	}

	private _getTime(val: DateImpl): number {
		return val.getSeconds() + val.getMinutes() * 60 + val.getHours() * 3600;
	}

	/** Returns the message about out of range value
	 * @return String
	 */
	public outOfRangeValue(): string {
		var format = this._wgt._format,
			separator = msgzul.OUT_OF_RANGE_SEPARATOR ? ' ' + msgzul.OUT_OF_RANGE_SEPARATOR + ' ' : ' ~ ';
		return msgzul.OUT_OF_RANGE + ': ' + (this._beg != null ? this._end != null ?
				new zk.fmt.Calendar(null, this._localizedSymbols).formatDate(this._beg, format) + separator
					+ new zk.fmt.Calendar().formatDate(this._end, format) :
					'>= ' + new zk.fmt.Calendar().formatDate(this._beg, format) :
					'<= ' + new zk.fmt.Calendar().formatDate(this._end!, format));
	}
}
zul.inp.SimpleLocalTimeConstraint = zk.regClass(SimpleLocalTimeConstraint);