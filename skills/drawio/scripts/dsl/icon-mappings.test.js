import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveIconShape, specSyntaxFor } from './icon-mappings.js'

test('icon mappings resolve aliases and k8s parameterized icons', () => {
  assert.equal(resolveIconShape('aws.ec2_instance'), 'mxgraph.aws4.ec2')
  assert.equal(resolveIconShape('k8s.pod'), 'mxgraph.kubernetes.icon2:prIcon=pod')
  assert.equal(resolveIconShape('shape;fillColor=red'), null)
})

test('icon mappings reverse supported skill syntax', () => {
  assert.equal(specSyntaxFor('mxgraph.aws4.s3'), 'aws.s3')
  assert.equal(specSyntaxFor('mxgraph.kubernetes.icon2', 'prIcon', 'pod'), 'k8s.pod')
})

test('icon mappings map natural kubernetes words to prIcon abbreviations', () => {
  assert.equal(resolveIconShape('k8s.deployment'), 'mxgraph.kubernetes.icon2:prIcon=deploy')
  assert.equal(resolveIconShape('k8s.service'), 'mxgraph.kubernetes.icon2:prIcon=svc')
})
