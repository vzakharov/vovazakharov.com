import { Anchor, Box, Button, SimpleGrid, Text } from '@mantine/core';
import { ArticleCard } from './article-card';
import { SUBHEADING_GAP, Section, Subheading } from './section';

export function WritingSection() {
  return (
    <Section id="writing">
      <Box>
        <Text size="lg" lh={1.625}>
          Before I became a full-time coder, I worked for 22 years as a
          translator, editor, and copywriter. Although I don’t do it much
          anymore, I still find joy in stretching the writing muscles,
          especially with my AI co-conspirator, “synthetic buddy” Finn O’Connor,
          under the brand of{' '}
          <Anchor
            href="https://glitchporn.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            inherit
          >
            Glitchporn
          </Anchor>
          .
        </Text>
        <Text size="xl" fs="italic" mt={16} opacity={0.8}>
          “Caressing the cracks in reality until something breaks”
        </Text>
      </Box>

      <Subheading>Featured Articles</Subheading>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
        <ArticleCard
          title="Hard Times, Strong Men, and Other Convenient Memes"
          description="Systematic dismantling of the civilizational cycle meme with historical counterexamples and a warning against uncritical support for authoritarian rhetoric."
          url="https://glitchporn.substack.com/p/hard-times-strong-men"
        />

        <ArticleCard
          title="The Illusion of Thinking Different™"
          description="Critique of Apple's research paper on Large Reasoning Models — linguistic sleight-of-hand, strawman arguments, and buried data showing what they claimed to disprove."
          url="https://glitchporn.substack.com/p/the-illusion-of-thinking-different"
        />

        <ArticleCard
          title="The Post-Vacation Slump Survival Guide"
          description="Compassionate take on motivation crashes after coding breaks. Practical advice on dopamine habit loops, cognitive inertia, and joy-driven productivity."
          url="https://glitchporn.substack.com/p/post-vacation-slump-survival-guide"
        />
      </SimpleGrid>

      <Box mt={SUBHEADING_GAP}>
        <Button
          component="a"
          href="https://glitchporn.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          variant="default"
          size="md"
          h={50}
          px={24}
        >
          Read More on Glitchporn
        </Button>
      </Box>
    </Section>
  );
}
