# Salesforce2Apex

Salesforce Apex Code Generator from Workflow Rules

## Usage

```bash
$ npm install -g salesforce2apex
```

```bash
$ salesforce2apex -f /path/to/workflow-metadata.workflow > hoge.trigger
```


input file
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
  <fieldUpdates>
    <fullName>barbarbar</fullName>
    <field>Bar__c</field>
    <formula>&quot;BBB&quot;</formula>
    <name>barbarbar</name>
    <notifyAssignee>false</notifyAssignee>
    <operation>Formula</operation>
    <protected>false</protected>
    <reevaluateOnChange>true</reevaluateOnChange>
  </fieldUpdates>
  <rules>
    <fullName>TestWorkflow</fullName>
    <actions>
      <name>test</name>
      <type>FieldUpdate</type>
    </actions>
    <active>true</active>
    <criteriaItems>
      <field>Foo__c.Bar__c</field>
      <operation>equals</operation>
      <value>AAA</value>
    </criteriaItems>
    <triggerType>onAllChanges</triggerType>
  </rules>
</Workflow>
```

output
```apex
trigger FooTrigger on Foo__c (before update) {
  if (Trigger.isBefore && Trigger.isUpdate) {
    for (Foo__c record : Trigger.New) {
      if (record.Bar__c == 'AAA') {
          record.Bar__c = 'BBB';
      }
    }
  }
}
```
