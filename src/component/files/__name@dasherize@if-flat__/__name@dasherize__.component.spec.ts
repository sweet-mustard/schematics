import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { <%= classify(name) %>Component } from './<%= dasherize(name) %>.component';

describe('<%= classify(name) %>Container', () => {
  let container: <%= classify(name) %>Container;
  let fixture: ComponentFixture<<%= classify(name) %>Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ <%= classify(name) %>Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(<%= classify(name) %>Component);
    container = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(container).toBeTruthy();
  });
});
