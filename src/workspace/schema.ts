export interface Schema {
    name: string;
    newProjectRoot?: string;
    skipInstall?: boolean;
    linkCli?: boolean;
    skipGit?: boolean;
    commit?: null | Commit;
    version: string;
}
export interface Commit {
    email: string;
    message?: string;
    name: string;
}