import { Component, OnInit, ViewChild } from '@angular/core'
import { HelpDialogComponent } from '../help-dialog/help-dialog.component'
import { ActivatedRoute, Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { NamelistsService } from './namelists.service'
import { Namelist, NamelistsByComponent, NamelistVarValue } from '../types/namelists'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { CdkTextareaAutosize } from '@angular/cdk/text-field'
import { MatSnackBar } from '@angular/material/snack-bar'
import { PleaseWaitOverlayService } from '../please-wait-overlay/please-wait-overlay.service'
import { forkJoin, Observable, of } from 'rxjs'
import { RpcNamelistsResponse } from '../types/RpcResponses'

interface Var {
  key: string
  value: NamelistVarValue
}

@Component({
  selector: 'app-namelists',
  templateUrl: './namelists.component.html',
  styleUrls: ['./namelists.component.scss'],
})
export class NamelistsComponent implements OnInit {
  isLoaded = false
  caseRoot: string // case dir or if isMultiCase=true the root of cases dirs
  isMultiCase: boolean = false
  defs: { [component: string]: any } = {}
  namelists: NamelistsByComponent = {}
  areNamelistsChanged = false
  forms: { [component: string]: UntypedFormGroup } = {}
  isFormValid: { [component: string]: boolean } = {}
  fileVars: { [component: string]: Var[] } = {}
  currentFiles: { [component: string]: string } = {}
  displayedColumns = ['key', 'value']
  readonly varInputKey = '___var$'
  readonly valueInputKey = '___value$'
  readonly window = window

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private namelistsService: NamelistsService,
    private pleaseWaitService: PleaseWaitOverlayService,
    private formBuilder: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {}

  @ViewChild('autosize') autosize: CdkTextareaAutosize

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.caseRoot = paramMap.get('caseRoot') ?? paramMap.get('multiRoot')
      this.isMultiCase = !!paramMap.get('multiRoot')

      if (this.isMultiCase) {
        this.namelistsService.getCaseList(this.caseRoot).subscribe((data) => {
          const caseRoots: string[] = Object.values(data).flatMap((x) => x)
          if (caseRoots.length === 0) {
            this.displayError('No cases found')
            this.router.navigate(['case-list'])
            return
          }
          const forkObject: { [caseRoot: string]: Observable<RpcNamelistsResponse> } = Object.fromEntries(
            caseRoots.map((dir) => [dir, this.namelistsService.getNamelists(dir)])
          )
          forkJoin<typeof forkObject, keyof typeof forkJoin>(forkObject).subscribe((forkData) => {
            Object.entries(forkData).forEach(([dir, res]) => this.mergeNamelists(res.namelists, dir))

            this.initForms()
            this.isLoaded = true
          })
        })
      } else {
        this.namelistsService.getNamelists(this.caseRoot).subscribe((data) => {
          this.namelists = data.namelists

          this.initForms()
          this.isLoaded = true
        })
      }
    })
  }

  onChanges(): void {
    this.getComponents().forEach((component) =>
      this.forms[component].valueChanges.subscribe((val) => {
        const keys = this.getKeysForComponent(component)
        const anyFileSelected = keys.map((key) => this.forms[component].controls[key].value).includes(true)
        const varSelected = !!this.forms[component].controls[this.varInputKey].value.trim()
        const valueSelected = !!this.forms[component].controls[this.valueInputKey].value.trim()
        this.isFormValid[component] = anyFileSelected && varSelected && valueSelected
      })
    )
  }

  getComponents(): string[] {
    return Object.keys(this.namelists)
  }

  onShowFile(component: string, filename: string) {
    const vars = this.namelists[component].find((entry) => entry.filename === filename).parsed
    this.fileVars[component] = Object.entries(vars)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => a.key.localeCompare(b.key))
    this.currentFiles[component] = filename
  }

  getVar(component: string, row: Var) {
    this.forms[component].get(this.varInputKey).setValue(row.key)
    this.forms[component].get(this.valueInputKey).setValue(row.value.join('\n'))
  }

  setVar(component: string) {
    const key = this.forms[component].get(this.varInputKey).value.trim()
    const value = this.forms[component].get(this.valueInputKey).value.trim()
    const selected = this.getKeysForComponent(component).filter((file) => this.forms[component].controls[file].value)

    selected.forEach((filename) =>
      this.namelists[component]
        .filter((entry) => entry.filename === filename)
        .forEach((entry) => (entry.parsed[key] = value.split('\n')))
    )

    if (this.currentFiles[component]) {
      this.onShowFile(component, this.currentFiles[component])
    }

    this.snackBar.open(`Variable "${key}" set`, '', { duration: 2000 })

    this.areNamelistsChanged = true
  }

  onSelectAll(component: string) {
    const keys = this.getKeysForComponent(component)
    const allSelected = keys.map((key) => this.forms[component].controls[key].value).every(Boolean)
    keys.forEach((key) => this.forms[component].controls[key].setValue(!allSelected))
  }

  saveNamelists() {
    const onSuccess = () => {
      this.snackBar.open(`Namelists saved`, '', { duration: 2000 })
      this.pleaseWaitService.hide()
    }

    this.pleaseWaitService.show()

    if (this.isMultiCase) {
      const flatList: Array<Namelist & { component: string }> = Object.entries(this.namelists).flatMap(
        ([component, namelists]) => namelists.map((namelist) => ({ component, ...namelist }))
      )

      const groupedByCaseRoot: { [caseRoot: string]: NamelistsByComponent } = {}
      flatList.forEach((item) => {
        groupedByCaseRoot[item.caseRoot] ??= {}
        groupedByCaseRoot[item.caseRoot][item.component] ??= []
        groupedByCaseRoot[item.caseRoot][item.component].push({
          ...item,
          filename: this.splitCaseRootAndFilename(item.filename),
        })
      })

      const forkObject: { [caseRoot: string]: Observable<RpcNamelistsResponse> } = Object.fromEntries(
        Object.entries(groupedByCaseRoot).map(([caseRoot, namelists]) => [
          caseRoot,
          this.namelistsService.updateNamelists(caseRoot, namelists),
        ])
      )

      forkJoin(forkObject).subscribe(onSuccess)
    } else {
      this.namelistsService.updateNamelists(this.caseRoot, this.namelists).subscribe(onSuccess)
    }
  }

  sortByFilename(a: Namelist, b: Namelist): number {
    return a.filename.localeCompare(b.filename)
  }

  getComponentHelp(component: string) {
    return this.namelistsService.getNamelistDefinitionLink(component)
  }

  private initForms(): void {
    for (const [component, entries] of Object.entries(this.namelists)) {
      const inputs = {
        [this.varInputKey]: '',
        [this.valueInputKey]: '',
      }
      entries.forEach((namelist) => (inputs[namelist.filename] = false))
      this.forms[component] = this.formBuilder.group(inputs)
    }

    this.onChanges()
  }

  private getKeysForComponent(component: string): string[] {
    return Object.keys(this.forms[component].controls).filter((key) => !this.isInternalInputKey(key))
  }

  private isInternalInputKey(key: string): boolean {
    return key === this.varInputKey || key === this.valueInputKey
  }

  private displayError(err: string) {
    this.dialog.open(HelpDialogComponent, {
      data: { header: 'ERROR', texts: [{ text: err, classes: 'pre-wrap monospace error' }] },
    })
  }

  private mergeNamelists(namelistsByComponent: NamelistsByComponent, caseRoot: string) {
    Object.entries(namelistsByComponent).forEach(([component, namelists]) => {
      if (!this.namelists.hasOwnProperty(component)) {
        this.namelists[component] = []
      }
      this.namelists[component].push(
        ...namelists.map((entry) => ({
          ...entry,
          caseRoot,
          filename: this.joinCaseRootAndFilename(caseRoot, entry.filename),
        }))
      )
    })
  }

  private joinCaseRootAndFilename(caseRoot: string, filename: string): string {
    const segments = caseRoot.split('/')
    return `${segments[segments.length - 1]}/${filename}`
  }

  private splitCaseRootAndFilename(filenameWithPath: string): string {
    const segments = filenameWithPath.split('/')
    return segments[segments.length - 1]
  }
}
