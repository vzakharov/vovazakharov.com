import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { elementWidget, widgetPlaceholder } from './widget-element.ts';

describe('widgetPlaceholder', () => {
  it('reads a widget off its figure’s props', () => {
    assert.deepEqual(
      widgetPlaceholder({
        'data-widget': 'domains',
        'data-widget-attributes': '{"label":"For one"}',
        'data-widget-items': '["solo.dev","one.party"]',
        'data-widget-source': 'singles-day.md',
        className: 'content-widget',
      }),
      {
        name: 'domains',
        attributes: { label: 'For one' },
        items: ['solo.dev', 'one.party'],
        source: 'singles-day.md',
      },
    );
  });

  it('leaves any other figure alone', () => {
    assert.equal(widgetPlaceholder({ className: 'diagram' }), undefined);
  });

  it('throws on a placeholder missing a part', () => {
    assert.throws(() => widgetPlaceholder({ 'data-widget': 'name' }));
  });
});

describe('elementWidget', () => {
  it('reads a widget off its compiled element’s properties', () => {
    assert.deepEqual(
      elementWidget({
        dataWidget: 'name',
        dataWidgetAttributes: '{"word":"solo"}',
        dataWidgetItems: '[]',
        dataWidgetSource: 'singles-day.md',
        className: ['content-widget'],
      }),
      {
        name: 'name',
        attributes: { word: 'solo' },
        items: [],
        source: 'singles-day.md',
      },
    );
  });

  it('leaves any other element alone', () => {
    assert.equal(elementWidget({ className: ['diagram'] }), undefined);
  });
});
