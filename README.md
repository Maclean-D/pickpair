# PickPair

![pickpair](https://raw.githubusercontent.com/Maclean-D/pickpair/refs/heads/master/pickpair.png)

Web application that allows users to compare options in pairs, generating Elo ratings for each option.

## Features

### Options
- Add, edit, and remove options
- Upload images for each option
- Export options as a ZIP file

### Vote
- Enter your name to start voting (Will also prevent you from voting on yourself)
- Compare options in pairs
- Skip comparisons if needed
- Undo previous selections

### Results
- View Elo ratings for each option
- See average ratings across all users
- View individual user ratings
- Export and import user data
- Delete individual user data
- Reset all results

## How to Run

1. Open a terminal and clone this repository
   ```
   git clone https://github.com/Maclean-D/pickpair.git
   ```
   
2. Navigate to the project directory.
   ```
   cd pickpair
   ```

3. Install dependencies:
   ```
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```   
   
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Options Tab**: Add your options, including titles, descriptions, and images.
2. **Vote Tab**: Enter your name and start comparing options in pairs.
3. **Results Tab**: View the Elo ratings for each option, manage user data, and analyze results.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Maclean-D/pickpair&type=Date)](https://star-history.com/#Maclean-D/pickpair&Date)

## Contributors

<a href="https://github.com/Maclean-D/pickpair/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Maclean-D/pickpair" />
</a>
