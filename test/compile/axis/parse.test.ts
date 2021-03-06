import {Y} from '../../../src/channel';
import {parseLayerAxes, parseUnitAxes} from '../../../src/compile/axis/parse';
import {parseLayerModel, parseUnitModelWithScale} from '../../util';

describe('Axis', () => {
  // TODO: move this to model.test.ts
  describe('= true', () => {
    it('should produce default properties for axis', () => {
      const model1 = parseUnitModelWithScale({
        mark: 'bar',
        encoding: {
          y: {type: 'quantitative', field: 'US_Gross', aggregate: 'sum'}
        },
        data: {url: 'data/movies.json'}
      });

      const model2 = parseUnitModelWithScale({
        mark: 'bar',
        encoding: {
          y: {type: 'quantitative', field: 'US_Gross', aggregate: 'sum'}
        },
        data: {url: 'data/movies.json'}
      });
      expect(model1.axis(Y)).toEqual(model2.axis(Y));
    });
  });
  describe('parseUnitAxis', () => {
    it('should produce Vega grid', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative',
            axis: {grid: true, gridColor: 'blue', gridWidth: 20}
          }
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].explicit.grid).toEqual(true);
    });

    it('should respect config even though the function could provide default value', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative'
          }
        },
        config: {axisQuantitative: {labelAlign: 'right'}}
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].implicit.labelAlign).toEqual('right');
    });

    it('should produce grid, orient, tickCount, labelExpr in the component when axis config is specified.', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative'
          }
        },
        config: {axisX: {grid: true, orient: 'right', tickCount: 20, labelExpr: 'abc'}}
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].implicit.grid).toEqual(true);
      expect(axisComponent['x'][0].implicit.orient).toEqual('right');
      expect(axisComponent['x'][0].implicit.tickCount).toEqual(20);
      expect(axisComponent['x'][0].implicit.labelExpr).toEqual('abc');
    });

    it('should include conditional axis config', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative'
          }
        },
        config: {
          axisX: {
            gridDash: {
              condition: {
                test: {field: 'value', timeUnit: 'monthdate', equal: {month: 1, date: 1}},
                value: null
              },
              value: [2, 2]
            }
          }
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].implicit.gridDash).toEqual({
        condition: {
          test: {field: 'value', timeUnit: 'monthdate', equal: {month: 1, date: 1}},
          value: null
        },
        value: [2, 2]
      });
    });

    it('should include axis property in style', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative',
            axis: {style: 'foo'}
          }
        },
        config: {
          style: {
            foo: {labelColor: 'red'}
          }
        }
      });

      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].implicit.labelColor).toEqual('red');
    });

    it('should produce axis component with grid=false', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative',
            axis: {grid: false, gridColor: 'blue', gridWidth: 20}
          }
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].explicit.grid).toEqual(false);
    });

    it('should ignore null scales', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          longitude: {
            field: 'a',
            type: 'quantitative'
          },
          latitude: {
            field: 'b',
            type: 'quantitative'
          }
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x']).not.toBeDefined();
      expect(axisComponent['y']).not.toBeDefined();
    });

    it('should produce Vega grid axis = undefined axis if grid is disabled via config.axisX', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative'
          }
        },
        config: {axisX: {grid: false}}
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].explicit.grid).toEqual(undefined);
    });

    it('should produce Vega grid axis = undefined axis if grid is disabled via config.axis', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative'
          }
        },
        config: {axis: {grid: false}}
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].explicit.grid).toEqual(undefined);
    });

    it('should store the title value if title = null, "", or false', () => {
      for (const val of [null, '', false]) {
        const model = parseUnitModelWithScale({
          mark: 'point',
          encoding: {
            x: {
              field: 'a',
              type: 'quantitative',
              axis: {title: val as any} // Need to cast as false is not valid, but we want to fall back gracefully
            }
          }
        });
        const axisComponent = parseUnitAxes(model);
        expect(axisComponent['x'].length).toEqual(1);
        expect(axisComponent['x'][0].explicit.title).toEqual(val as any);
      }
    });

    it('should store the fieldDef title value if title = null, "", or false', () => {
      for (const val of [null, '', false]) {
        const model = parseUnitModelWithScale({
          mark: 'point',
          encoding: {
            x: {
              field: 'a',
              type: 'quantitative',
              title: val as any // Need to cast as false is not valid, but we want to fall back gracefully
            }
          }
        });
        const axisComponent = parseUnitAxes(model);
        expect(axisComponent['x'].length).toEqual(1);
        expect(axisComponent['x'][0].explicit.title).toEqual(val as any);
      }
    });

    it('should store fieldDef.title as explicit', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative',
            title: 'foo'
          }
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].explicit.title).toBe('foo');
    });

    it('should produces correct axis encode', () => {
      const model = parseUnitModelWithScale({
        mark: 'point',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative',
            axis: {
              encoding: {
                labels: {
                  dx: {signal: 'a'},
                  dy: {value: 2}
                }
              }
            }
          }
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].explicit.encode).toEqual({
        labels: {
          update: {
            dx: {signal: 'a'},
            dy: {value: 2}
          }
        }
      });
    });

    it('should merge title of fieldDef and fieldDef2', () => {
      const model = parseUnitModelWithScale({
        mark: 'bar',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative',
            title: 'foo'
          },
          x2: {
            field: 'b',
            title: 'bar'
          }
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].explicit.title).toBe('foo, bar');
    });

    it('should use title of fieldDef2', () => {
      const model = parseUnitModelWithScale({
        mark: 'bar',
        encoding: {
          x: {
            field: 'a',
            type: 'quantitative'
          },
          x2: {
            field: 'b',
            title: 'bar'
          }
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].explicit.title).toBe('bar');
    });

    it('should store both x and x2 for ranged mark', () => {
      const model = parseUnitModelWithScale({
        mark: 'rule',
        encoding: {
          x: {field: 'a', type: 'quantitative'},
          x2: {field: 'a2'}
        }
      });
      const axisComponent = parseUnitAxes(model);
      expect(axisComponent['x'].length).toEqual(1);
      expect(axisComponent['x'][0].get('title')).toEqual([{field: 'a'}, {field: 'a2'}]);
    });
  });

  describe('parseLayerAxis', () => {
    const globalRuleOverlay = parseLayerModel({
      layer: [
        {
          mark: 'rule',
          encoding: {
            y: {
              aggregate: 'mean',
              field: 'a',
              type: 'quantitative'
            }
          }
        },
        {
          mark: 'line',
          encoding: {
            y: {
              aggregate: 'mean',
              field: 'a',
              type: 'quantitative'
            },
            x: {
              timeUnit: 'month',
              type: 'temporal',
              field: 'date'
            }
          }
        }
      ]
    });
    globalRuleOverlay.parseScale();
    globalRuleOverlay.parseLayoutSize();
    parseLayerAxes(globalRuleOverlay);

    it('correctly merges gridScale if one layer does not have one of the axis', () => {
      const axisComponents = globalRuleOverlay.component.axes;
      expect(axisComponents.y.length).toEqual(1);
      expect(axisComponents.y[0].get('gridScale')).toBe('x');
    });

    it('correctly merges similar title', () => {
      const axisComponents = globalRuleOverlay.component.axes;
      expect(axisComponents.y[0].get('title')).toEqual([{aggregate: 'mean', field: 'a'}]);
    });

    it('correctly combines different title', () => {
      const model = parseLayerModel({
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        data: {url: 'data/cars.json'},
        layer: [
          {
            mark: 'line',
            encoding: {
              x: {field: 'Cylinders', type: 'ordinal'},
              y: {
                aggregate: 'max',
                field: 'Horsepower',
                type: 'quantitative'
              },
              color: {value: 'darkred'}
            }
          },
          {
            data: {url: 'data/cars.json'},
            mark: 'line',
            encoding: {
              x: {field: 'Cylinders', type: 'ordinal'},
              y: {
                aggregate: 'min',
                field: 'Horsepower',
                type: 'quantitative'
              }
            }
          }
        ]
      });
      model.parseScale();
      parseLayerAxes(model);
      const axisComponents = model.component.axes;

      expect(axisComponents.y[0].get('title')).toEqual([
        {aggregate: 'max', field: 'Horsepower'},
        {aggregate: 'min', field: 'Horsepower'}
      ]);
    });

    it('correctly combines different title with null', () => {
      const model = parseLayerModel({
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        data: {url: 'data/cars.json'},
        layer: [
          {
            mark: 'line',
            encoding: {
              x: {field: 'Cylinders', type: 'ordinal', title: 'Hello'},
              y: {
                aggregate: 'max',
                field: 'Horsepower',
                type: 'quantitative',
                title: 'HP'
              },
              color: {value: 'darkred'}
            }
          },
          {
            data: {url: 'data/cars.json'},
            mark: 'line',
            encoding: {
              x: {field: 'Cylinders', type: 'ordinal', title: 'World'},
              y: {
                aggregate: 'min',
                field: 'Horsepower',
                type: 'quantitative',
                title: null // remove the title entirely
              }
            }
          }
        ]
      });
      model.parseScale();
      parseLayerAxes(model);
      const axisComponents = model.component.axes;

      expect(axisComponents.x[0].get('title')).toEqual('Hello, World');
      expect(axisComponents.y[0].get('title')).toEqual(null);
    });
  });
});
