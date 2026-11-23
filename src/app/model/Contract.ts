/*
 * Ported from app/model/Contract.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.model.Contract', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'internalRef', type: 'string' },
        { name: 'transactionType', type: 'string', defaultValue: 'Sale' },
        { name: 'counterpartyId', type: 'int', allowNull: true },
        { name: 'legalEntityId', type: 'int', allowNull: true },
        { name: 'marketParticipant', type: 'string' },
        { name: 'orderOfAccount', type: 'string' },
        { name: 'studyContract', type: 'boolean', defaultValue: false },
        { name: 'timeZone', type: 'string', defaultValue: 'IST' },
        { name: 'effectiveDate', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'startDate', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'endDate', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'commodities', type: 'auto', defaultValue: [] },
        { name: 'nodeId', type: 'int', allowNull: true },
        { name: 'meterId', type: 'int', allowNull: true },
        { name: 'holidayCalendar', type: 'string', defaultValue: 'India - National' },
        { name: 'contractedMw', type: 'number', allowNull: true },
        { name: 'notes', type: 'string' },
        { name: 'status', type: 'string', defaultValue: 'Draft', persist: false },
        { name: 'validated', type: 'boolean', persist: false },
        { name: 'version', type: 'int', defaultValue: 1, persist: false },
        { name: 'createdBy', type: 'string', persist: false },
        { name: 'createdAt', type: 'date', dateFormat: 'c', persist: false },
        { name: 'updatedBy', type: 'string', persist: false },
        { name: 'updatedAt', type: 'date', dateFormat: 'c', persist: false },
        { name: 'approvedBy', type: 'string', persist: false },
        // Joined names returned by the API for display only.
        { name: 'counterpartyName', type: 'string', persist: false },
        { name: 'legalEntityName', type: 'string', persist: false },
        { name: 'nodeName', type: 'string', persist: false },
        { name: 'meterName', type: 'string', persist: false },
        { name: 'componentCount', type: 'int', persist: false },
        // Sent once with a save; becomes the version comment / audit reason.
        { name: 'versionComment', type: 'string' },
        { name: 'commodityList', persist: false, depends: ['commodities'], calculate: function (d) { return (d.commodities || []).join(', '); } }
    ],
    validators: {
        name: [{ type: 'presence' }, { type: 'length', max: 80 }],
        type: 'presence',
        counterpartyId: 'presence',
        legalEntityId: 'presence'
    },
    proxy: { type: 'gt-rest', url: 'api/contracts' }
});
