# American Express Web Frameworks Assessment

## Task 1 Configuration

- Moved .gitignore to the root directory for easier path management
- Added generated files and file directories to .gitignore

I didn't have enough time to set up build scripts for dev and prod environments but it is something I should have done.
I was attempting to update tsconfig module and target but having to compile node and react files was causing breaking changes. If I had more time, I wanted to create separate tsconfig files and compile with tsc or a bundler.
The MSW server is still running the mock enabled server, if I set up a prod environment, I wanted to conditionally disable this.

## Task 2 Reflection

My immediate thought while going over the project code for the first time was that the data type defined for the useCachingFetch hook used the unknown type for the data field. I felt that it would be wise for a production-ready project to have the data object be type-validated such that future development using the data would be more efficient. After defining a type and doing the validation, I realized while looking at the other files that there was already a validation implementation using valibot, but I still stand by using Typescript types to improve the developer experience.

After finishing the implementation, I noticed that the hook is called twice for every single Person in the response data, resulting in 150 calls. This could get out of hand in the future if the scale of the project were to increase. If I were to continue work on this project, I might consider implementing global state management or simply passing data as a prop to propogate to the Person and Name components.
