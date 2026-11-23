/*
 * Ported from app/util/Xlsx.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Minimal .xlsx writer (one sheet, bold header row, numbers stay numbers) with no dependencies.
 * Replaces the premium Ext JS "exporter" package for grid exports.
 *
 *   GT.util.Xlsx.download('trades.xlsx', 'Trades', ['Id', 'Price'], [['T1', 4500], ['T2', 5100]]);
 */
Ext.define('GT.util.Xlsx', {
    singleton: true,

    crcTable: null,

    crc32: function (bytes) {
        var table = this.crcTable, crc = -1, i, c, n, k;
        if (!table) {
            table = this.crcTable = [];
            for (n = 0; n < 256; n++) {
                c = n;
                for (k = 0; k < 8; k++) { c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; }
                table[n] = c >>> 0;
            }
        }
        for (i = 0; i < bytes.length; i++) { crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF]; }
        return (crc ^ -1) >>> 0;
    },

    /** Stored (uncompressed) zip of { name: string } files. */
    zip: function (files) {
        var me = this, enc = new TextEncoder(), parts = [], central = [], offset = 0;
        var u16 = function (v) { return [v & 0xFF, (v >>> 8) & 0xFF]; };
        var u32 = function (v) { return [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]; };
        Ext.Object.each(files, function (name, text) {
            var data = enc.encode(text), nameBytes = enc.encode(name), crc = me.crc32(data);
            var common = [].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0));
            var local = new Uint8Array([].concat(u32(0x04034B50), common));
            parts.push(local, nameBytes, data);
            central.push(new Uint8Array([].concat(u32(0x02014B50), u16(20), common, u16(0), u16(0), u16(0), u32(0), u32(offset))), nameBytes);
            offset += local.length + nameBytes.length + data.length;
        });
        var centralSize = central.reduce(function (s, p) { return s + p.length; }, 0);
        var count = Object.keys(files).length;
        var end = new Uint8Array([].concat(u32(0x06054B50), u16(0), u16(0), u16(count), u16(count), u32(centralSize), u32(offset), u16(0)));
        return new Blob(parts.concat(central, [end]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    },

    esc: function (v) {
        return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    },

    colName: function (i) {
        var s = '';
        for (i += 1; i > 0; i = Math.floor((i - 1) / 26)) { s = String.fromCharCode(65 + ((i - 1) % 26)) + s; }
        return s;
    },

    build: function (sheetName, header, rows) {
        var me = this;
        var cell = function (v, r, c, style) {
            var ref = me.colName(c) + r, s = style ? ' s="1"' : '';
            if (typeof v === 'number' && isFinite(v)) { return '<c r="' + ref + '"' + s + '><v>' + v + '</v></c>'; }
            if (v === null || v === undefined || v === '') { return ''; }
            return '<c r="' + ref + '" t="inlineStr"' + s + '><is><t xml:space="preserve">' + me.esc(v) + '</t></is></c>';
        };
        var xmlRows = ['<row r="1">' + header.map(function (h, c) { return cell(h, 1, c, true); }).join('') + '</row>'];
        rows.forEach(function (row, i) {
            xmlRows.push('<row r="' + (i + 2) + '">' + row.map(function (v, c) { return cell(v, i + 2, c, false); }).join('') + '</row>');
        });
        var cols = header.map(function (h, c) {
            var w = Math.min(60, Math.max(String(h).length, rows.reduce(function (m, r) { return Math.max(m, String(r[c] === null || r[c] === undefined ? '' : r[c]).length); }, 0)) + 2);
            return '<col min="' + (c + 1) + '" max="' + (c + 1) + '" width="' + w + '" customWidth="1"/>';
        }).join('');
        var ns = 'http://schemas.openxmlformats.org/';
        return {
            '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="' + ns + 'package/2006/content-types">' +
                '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
                '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
                '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
                '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
            '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="' + ns + 'package/2006/relationships">' +
                '<Relationship Id="rId1" Type="' + ns + 'officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
            'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="' + ns + 'spreadsheetml/2006/main" xmlns:r="' + ns + 'officeDocument/2006/relationships">' +
                '<sheets><sheet name="' + me.esc(String(sheetName || 'Sheet1').replace(/[\\\/?*\[\]:]/g, ' ').slice(0, 31)) + '" sheetId="1" r:id="rId1"/></sheets></workbook>',
            'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="' + ns + 'package/2006/relationships">' +
                '<Relationship Id="rId1" Type="' + ns + 'officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
                '<Relationship Id="rId2" Type="' + ns + 'officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
            'xl/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="' + ns + 'spreadsheetml/2006/main">' +
                '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
                '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
                '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
                '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
                '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
                '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
                '</styleSheet>',
            'xl/worksheets/sheet1.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="' + ns + 'spreadsheetml/2006/main">' +
                '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
                '<cols>' + cols + '</cols><sheetData>' + xmlRows.join('') + '</sheetData></worksheet>'
        };
    },

    download: function (fileName, sheetName, header, rows) {
        var blob = this.zip(this.build(sheetName, header, rows));
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    }
});
