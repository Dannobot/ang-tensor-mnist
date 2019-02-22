import { TestBed } from '@angular/core/testing';

import { UiServService } from './ui-serv.service';

describe('UiServService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UiServService = TestBed.get(UiServService);
    expect(service).toBeTruthy();
  });
});
