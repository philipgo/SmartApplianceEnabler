import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SaeService} from '../shared/sae-service';
import {HttpClient} from '@angular/common/http';
import {Status} from './status';
import {StatusFactory} from './status-factory';
import {Logger} from '../log/logger';
import {map, tap} from 'rxjs/operators';

@Injectable()
export class StatusService extends SaeService {

  statusFactory: StatusFactory;

  constructor(private logger: Logger,
              protected http: HttpClient) {
    super(http);
    this.statusFactory = new StatusFactory(logger);
  }

  getStatus(): Observable<Array<Status>> {
    return this.http.get(`${SaeService.API}/status`)
      .pipe(map((statuses: Array<Status>) => {
        return statuses.map(
          status => this.statusFactory.toStatusFromJSON(status));
      }));
  }

  suggestRuntime(id: string): Observable<string> {
    const url = `${SaeService.API}/runtime?id=${id}`;
    this.logger.debug('Get suggested runtime using ' + url);
    return this.http.get(url, {responseType: 'text'})
      .pipe(tap(next => this.logger.debug('Suggested runtime: ' + next)));
  }

  setRuntime(id: string, runtime: number): Observable<any> {
    const url = `${SaeService.API}/runtime?id=${id}&runtime=${runtime}`;
    this.logger.debug('Set runtime using ' + url);
    return this.http.put(url, '', {responseType: 'text'});
  }

  getSoc(id: string, evId: number): Observable<string> {
    const url = `${SaeService.API}/evcharge?applianceid=${id}&evid=${evId}`;
    this.logger.debug('Get SOC using ' + url);
    return this.http.get(url, {responseType: 'text'})
      .pipe(tap(next => this.logger.debug('SOC: ' + next)));
  }

  requestEvCharge(applianceid: string, evid: string, socCurrent: number|undefined,
                  socRequested: number|undefined, chargeEnd: string|undefined): Observable<any> {
    let url = `${SaeService.API}/evcharge?applianceid=${applianceid}&evid=${evid}`;
    if (socCurrent) {
      url += `&socCurrent=${socCurrent}`;
    }
    if (socRequested) {
      url += `&socRequested=${socRequested}`;
    }
    if (chargeEnd) {
      url += `&chargeEnd=${chargeEnd}`;
    }
    this.logger.debug('Request ev charge using ' + url);
    return this.http.put(url, '', {responseType: 'text'});
  }

  toggleAppliance(id: string, turnOn: boolean): Observable<any> {
    const url = `${SaeService.SEMP_API}`;
    const content = '<EM2Device xmlns="http://www.sma.de/communication/schema/SEMP/v1"><DeviceControl>' +
      '<DeviceId>' + id + '</DeviceId><On>' + turnOn + '</On></DeviceControl></EM2Device>';
    this.logger.debug('Toggle appliance using ' + url);
    this.logger.debug('Content: ' + content);
    return this.http.post(url, content,
      {headers: this.headersContentTypeXml, responseType: 'text'});
  }
}
